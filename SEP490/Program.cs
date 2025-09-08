using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SEP490.Common.Services;
using SEP490.Common.Constants;
using SEP490.DB;
using SEP490.Hubs;
using SEP490.Modules.Auth.Middleware;

using SEP490.Modules.ZaloOrderModule.Services;
using Microsoft.OpenApi.Models;
using System.Reflection;
using System.Text;
using SEP490.Modules.InventorySlipModule.Service;
using Microsoft.AspNetCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);
//builder.WebHost.UseUrls("http://0.0.0.0:5000");

var mysqlVersionString = builder.Configuration["Database:MySqlVersion"];
var mysqlVersion = new MySqlServerVersion(Version.Parse(mysqlVersionString));

builder.Services.AddDbContext<SEP490DbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        mysqlVersion).UseSnakeCaseNamingConvention());



// Add JWT Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "your-secret-key-here"))
        };
    });

//builder.Services.AddScoped<IInventorySlipService, InventorySlipService>();
//builder.Services.AddScoped<IInventoryProductionOutputService, ProductionOutputService>();
builder.Services.AddHttpContextAccessor();
// Add Authorization
builder.Services.AddAuthorization(options =>
{
    // Default policy - require authentication
    options.DefaultPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    // Role-based policies

    options.AddPolicy("Manager", policy =>
        policy.RequireRole(Roles.MANAGER));

    options.AddPolicy("ProductionAccess", policy =>
        policy.RequireRole(Roles.PRODUCTION, Roles.MANAGER));

    options.AddPolicy("AccountantAccess", policy =>
        policy.RequireRole(Roles.ACCOUNTANT, Roles.MANAGER));
});


// HTTP client registrations
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddSignalR();

// Register all services that inherit from BaseService (legacy)
var baseType = typeof(BaseService);

var legacyServiceTypes = Assembly.GetExecutingAssembly()
    .GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && baseType.IsAssignableFrom(t) && t != typeof(ZaloWebhookService));

foreach (var implementation in legacyServiceTypes)
{
    var interfaces = implementation.GetInterfaces();

    // Register with each interface it implements (if any)
    foreach (var serviceInterface in interfaces)
    {
        builder.Services.AddTransient(serviceInterface, implementation);
    }
}

// Register all services that inherit from BaseTransientService
var transientBaseType = typeof(BaseTransientService);
var transientServiceTypes = Assembly.GetExecutingAssembly()
    .GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && transientBaseType.IsAssignableFrom(t));

foreach (var implementation in transientServiceTypes)
{
    var interfaces = implementation.GetInterfaces();

    // Register with each interface it implements (if any)
    foreach (var serviceInterface in interfaces)
    {
        builder.Services.AddTransient(serviceInterface, implementation);
    }
}

// Register all services that inherit from BaseScopedService
var scopedBaseType = typeof(BaseScopedService);
var scopedServiceTypes = Assembly.GetExecutingAssembly()
    .GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && scopedBaseType.IsAssignableFrom(t));

foreach (var implementation in scopedServiceTypes)
{
    var interfaces = implementation.GetInterfaces();

    // Register with each interface it implements (if any)
    foreach (var serviceInterface in interfaces)
    {
        builder.Services.AddScoped(serviceInterface, implementation);
    }
}

// Register all services that inherit from BaseSingletonService
var singletonBaseType = typeof(BaseSingletonService);
var singletonServiceTypes = Assembly.GetExecutingAssembly()
    .GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && singletonBaseType.IsAssignableFrom(t));

foreach (var implementation in singletonServiceTypes)
{
    var interfaces = implementation.GetInterfaces();

    // Register with each interface it implements (if any)
    foreach (var serviceInterface in interfaces)
    {
        builder.Services.AddSingleton(serviceInterface, implementation);
    }
}

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "VNG Glass API", Version = "v1" });
    
    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});
// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins!)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors("AllowFrontend");
app.UseHttpsRedirection();
app.UseMiddleware<PermissionMiddleware>();
app.UseAuthentication();
app.UseAuthorization();
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "text/plain";

        var error = context.Features.Get<IExceptionHandlerFeature>();
        if (error != null)
        {
            var ex = error.Error;
            await context.Response.WriteAsync("Something went wrong: " + ex.Message);
            Console.WriteLine($"Error: {ex.Message}" + ex.StackTrace);
        }
    });
});
app.MapControllers();
app.MapHub<OrderHub>("/orderHub");
app.MapHub<SaleOrderHub>("/saleOrderHub");

app.Run();