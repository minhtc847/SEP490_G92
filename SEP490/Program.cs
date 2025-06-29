using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.Modules.LLMChat.Services;
using SEP490.Modules.OrderModule.ManageOrder.Services;
using SEP490.Modules.Users.Services;
using SEP490.Modules.Zalo.Services;
using System;
using System.Reflection;
using System.Text;
var builder = WebApplication.CreateBuilder(args);
var jwtKey = builder.Configuration["Jwt:Key"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];

var mysqlVersionString = builder.Configuration["Database:MySqlVersion"];
var mysqlVersion = new MySqlServerVersion(Version.Parse(mysqlVersionString));

builder.Services.AddDbContext<SEP490DbContext>(options =>
    options.UseMySql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        mysqlVersion).UseSnakeCaseNamingConvention());
// Add services to the container.
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddScoped<IZaloChatForwardService, ZaloChatForwardService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddHttpClient<ZaloChatService>();
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey!))
    };
});
// Register all services that inherit from BaseService
var baseType = typeof(BaseService);

var serviceTypes = Assembly.GetExecutingAssembly()
    .GetTypes()
    .Where(t => t.IsClass && !t.IsAbstract && baseType.IsAssignableFrom(t));

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
builder.Services.AddSwaggerGen();

// Configure CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(allowedOrigins!)
              .AllowAnyHeader()
              .AllowAnyMethod();
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
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();