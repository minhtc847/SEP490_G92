using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SEP490.Common.Services;
using SEP490.DB;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    /// <summary>
    /// Service for managing Zalo tokens
    /// </summary>
    public interface IZaloTokenService
    {
        Task<string?> GetAccessTokenAsync();
    }

    public class ZaloTokenService : BaseScopedService, IZaloTokenService
    {
        private readonly SEP490DbContext _context;
        private readonly ILogger<ZaloTokenService> _logger;

        public ZaloTokenService(SEP490DbContext context, ILogger<ZaloTokenService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<string?> GetAccessTokenAsync()
        {
            try
            {
                _logger.LogInformation("Attempting to get Zalo access token...");
                
                var token = await _context.ZaloTokens.FirstOrDefaultAsync();
                _logger.LogInformation("Database query completed. Token found: {TokenFound}", token != null);
                
                if (token == null)
                {
                    _logger.LogError("No Zalo token found in database");
                    return null;
                }

                _logger.LogInformation("Token found - ID: {Id}, ExpiresAt: {ExpiresAt}, Current time: {CurrentTime}", 
                    token.Id, token.AccessTokenExpiresAt, DateTime.UtcNow);

                // Check if token is expired
                if (token.AccessTokenExpiresAt <= DateTime.UtcNow)
                {
                    _logger.LogWarning("Zalo token is expired. Please refresh the token manually.");
                    return null;
                }

                _logger.LogInformation("Returning valid access token");
                return token.AccessToken;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting Zalo access token");
                return null;
            }
        }
    }
}
