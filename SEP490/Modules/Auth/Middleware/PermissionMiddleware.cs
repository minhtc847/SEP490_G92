using Microsoft.AspNetCore.Http;
using SEP490.Modules.Auth.Services;
using System.Security.Claims;

namespace SEP490.Modules.Auth.Middleware
{
    public class PermissionMiddleware
    {
        private readonly RequestDelegate _next;

        public PermissionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IAuthService authService)
        {
            var endpoint = context.GetEndpoint();
            if (endpoint == null)
            {
                await _next(context);
                return;
            }

            var permissionAttribute = endpoint.Metadata.GetMetadata<RequirePermissionAttribute>();
            if (permissionAttribute == null)
            {
                await _next(context);
                return;
            }

            var userIdClaim = context.User.FindFirst("userId");
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                context.Response.StatusCode = 401;
                await context.Response.WriteAsJsonAsync(new { message = "Unauthorized" });
                return;
            }

            var hasPermission = await authService.HasPermissionAsync(userId, permissionAttribute.Permission);
            if (!hasPermission)
            {
                context.Response.StatusCode = 403;
                await context.Response.WriteAsJsonAsync(new { message = "Forbidden - Insufficient permissions" });
                return;
            }

            await _next(context);
        }
    }

    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
    public class RequirePermissionAttribute : Attribute
    {
        public string Permission { get; }

        public RequirePermissionAttribute(string permission)
        {
            Permission = permission;
        }
    }
} 