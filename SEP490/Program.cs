using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.Hubs;
using SEP490.Modules.Auth.Middleware;
using SEP490.Modules.Auth.Services;
using SEP490.Modules.LLMChat.Services;
using SEP490.Modules.OrderModule.ManageOrder.Services;
using SEP490.Modules.Zalo.Services;
using SEP490.Modules.ZaloOrderModule.Services;
using SEP490.Modules.ProductionOrders.Services;
using StackExchange.Redis;
using System;
using System.Reflection;
using System.Text;
using SEP490.Modules.InventorySlipModule.Service;
using SEP490.Modules.InventorySlipModule.Services;

var builder = WebApplication.CreateBuilder(args);

var mysqlVersionString = builder.Configuration["Database:MySqlVersion"];
var mysqlVersion = new MySqlServerVersion(Version.Parse(mysqlVersionString));

builder.Services.AddDbContext<SEP490DbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        mysqlVersion).UseSnakeCaseNamingConvention());

// Add Redis
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var configuration = builder.Configuration.GetConnectionString("Redis") ?? "localhost:6379";
    return ConnectionMultiplexer.Connect(configuration);
});

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

// Add services to the container.
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IZaloChatForwardService, ZaloChatForwardService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ICuttingGlassManagementService, CuttingGlassManagementService>();
builder.Services.AddScoped<IDocumentMaterialService, DocumentMaterialService>();
builder.Services.AddScoped<IZaloOrderService, ZaloOrderService>();
builder.Services.AddScoped<IInventorySlipService, InventorySlipService>();
builder.Services.AddScoped<IInventoryProductionOutputService, ProductionOutputService>();
builder.Services.AddScoped<IProductionOrderService, ProductionOrderService>();
builder.Services.AddHttpClient<ZaloChatService>();
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddSignalR();

// Add ZaloOrderModule services
builder.Services.AddSingleton<ZaloConversationStateService>();
builder.Services.AddTransient<ZaloResponseService>();
builder.Services.AddTransient<ZaloMessageProcessorService>();
builder.Services.AddTransient<IZaloMessageHistoryService, ZaloMessageHistoryService>();
builder.Services.AddTransient<IZaloCustomerService, ZaloCustomerService>();
builder.Services.AddTransient<IZaloProductValidationService, ZaloProductValidationService>();
builder.Services.AddScoped<IZaloTokenService, ZaloTokenService>();
builder.Services.AddScoped<IZaloWebhookService, ZaloWebhookService>();
builder.Services.AddSingleton<IZaloWebhookServiceFactory, ZaloWebhookServiceFactory>();
builder.Services.AddSingleton<IRedisHealthCheckService, RedisHealthCheckService>();

// Register all services that inherit from BaseService
var baseType = typeof(BaseService);

var serviceTypes = Assembly.GetExecutingAssembly()
    .GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && baseType.IsAssignableFrom(t) && t != typeof(ZaloWebhookService));

foreach (var implementation in serviceTypes)
{
    var interfaces = implementation.GetInterfaces();

    // Register with each interface it implements (if any)
    foreach (var serviceInterface in interfaces)
    {
        builder.Services.AddTransient(serviceInterface, implementation);
    }
}

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SEP490 API", Version = "v1" });
    
    // Configure JWT authentication for Swagger
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

app.MapControllers();
app.MapHub<OrderHub>("/orderHub");
app.MapHub<SaleOrderHub>("/saleOrderHub");

app.Run();