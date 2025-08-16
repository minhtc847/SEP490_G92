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
        Task<bool> RefreshTokenAsync();
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
                    _logger.LogWarning("Zalo token is expired, attempting to refresh");
                    var refreshed = await RefreshTokenAsync();
                    if (!refreshed)
                    {
                        _logger.LogError("Failed to refresh expired Zalo token");
                        return null;
                    }
                    
                    // Get the refreshed token
                    var refreshedToken = await _context.ZaloTokens.FirstOrDefaultAsync();
                    return refreshedToken?.AccessToken;
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

        public async Task<bool> RefreshTokenAsync()
        {
            try
            {
                var token = await _context.ZaloTokens.FirstOrDefaultAsync();
                if (token == null)
                {
                    _logger.LogError("No Zalo token found for refresh");
                    return false;
                }

                // TODO: Implement token refresh logic
                // For now, just log that refresh is needed
                _logger.LogWarning("Token refresh not implemented yet");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error refreshing Zalo token");
                return false;
            }
        }
    }
}
