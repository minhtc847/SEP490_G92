using System.Text;
using System.Text.Json;

namespace SEP490.Modules.Zalo.Services
{
    public interface IZaloMessageService
    {
        Task<bool> SendTextMessageAsync(string userId, string message);
        Task<string?> GetUserInfoAsync(string userId);
    }

    public class ZaloMessageService : IZaloMessageService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ZaloMessageService> _logger;
        private readonly IConfiguration _configuration;
        private string _accessToken;
        private readonly string _oaId;

        public ZaloMessageService(HttpClient httpClient, ILogger<ZaloMessageService> logger, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _logger = logger;
            _configuration = configuration;
            _accessToken = configuration["Zalo:AccessToken"] ?? "";
            _oaId = configuration["Zalo:OAId"] ?? "";
        }

        /// <summary>
        /// Gửi tin nhắn text tới user qua Zalo OA với auto-retry khi token invalid
        /// </summary>
        public async Task<bool> SendTextMessageAsync(string userId, string message)
        {
            try
            {
                // Thử gửi với token hiện tại
                var success = await SendMessageWithTokenAsync(userId, message, _accessToken);
                
                if (!success)
                {
                    _logger.LogWarning("First attempt failed, trying to refresh token...");
                    
                    // Nếu thất bại, thử refresh token và gửi lại
                    var newToken = await RefreshAccessTokenAsync();
                    if (!string.IsNullOrEmpty(newToken))
                    {
                        _accessToken = newToken;
                        success = await SendMessageWithTokenAsync(userId, message, _accessToken);
                        
                        if (success)
                        {
                            _logger.LogInformation("Message sent successfully after token refresh");
                        }
                    }
                }
                
                return success;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while sending Zalo message to {UserId}", userId);
                return false;
            }
        }

        /// <summary>
        /// Gửi tin nhắn với token cụ thể
        /// </summary>
        private async Task<bool> SendMessageWithTokenAsync(string userId, string message, string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("Access token is empty, skipping message send");
                    return false;
                }

                var requestData = new
                {
                    recipient = new { user_id = userId },
                    message = new { text = message }
                };

                var jsonContent = JsonSerializer.Serialize(requestData);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("access_token", token);

                var response = await _httpClient.PostAsync("https://openapi.zalo.me/v3.0/oa/message/cs", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Zalo message sent successfully to {UserId}. Response: {Response}", userId, responseContent);
                    return true;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to send Zalo message to {UserId}. Status: {Status}, Error: {Error}", 
                        userId, response.StatusCode, errorContent);
                    
                    // Check if error is token-related or API version issue
                    if (errorContent.Contains("-216") || errorContent.Contains("Access token is invalid") ||
                        errorContent.Contains("-240") || errorContent.Contains("MessageV2 API has been shut down"))
                    {
                        _logger.LogWarning("Token invalid or API version error detected for user {UserId}", userId);
                        return false; // This will trigger token refresh in parent method
                    }
                    
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while sending message with token to {UserId}", userId);
                return false;
            }
        }

        /// <summary>
        /// Refresh Zalo Access Token
        /// </summary>
        private async Task<string?> RefreshAccessTokenAsync()
        {
            try
            {
                var appId = _configuration["Zalo:AppId"];
                var appSecret = _configuration["Zalo:AppSecret"];

                if (string.IsNullOrEmpty(appId) || string.IsNullOrEmpty(appSecret))
                {
                    _logger.LogError("Zalo AppId or AppSecret is missing in configuration");
                    return null;
                }

                var requestData = new
                {
                    app_id = appId,
                    app_secret = appSecret,
                    grant_type = "client_credentials"
                };

                var jsonContent = JsonSerializer.Serialize(requestData);
                var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync("https://oauth.zaloapp.com/v4/oa/access_token", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var tokenResponse = JsonSerializer.Deserialize<ZaloTokenResponse>(responseContent);

                    if (tokenResponse?.Error == 0 && !string.IsNullOrEmpty(tokenResponse.Data?.AccessToken))
                    {
                        _logger.LogInformation("Successfully refreshed Zalo access token");
                        return tokenResponse.Data.AccessToken;
                    }
                    else
                    {
                        _logger.LogError("Failed to refresh token. Error: {Error}, Message: {Message}", 
                            tokenResponse?.Error, tokenResponse?.Message);
                        return null;
                    }
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("HTTP error when refreshing token. Status: {Status}, Error: {Error}", 
                        response.StatusCode, errorContent);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while refreshing access token");
                return null;
            }
        }

        /// <summary>
        /// Lấy thông tin user từ Zalo API
        /// </summary>
        public async Task<string?> GetUserInfoAsync(string userId)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("access_token", _accessToken);

                // Zalo API endpoint cho việc lấy thông tin user
                var requestData = JsonSerializer.Serialize(new { user_id = userId });
                var encodedData = Uri.EscapeDataString(requestData);
                var url = $"https://openapi.zalo.me/v3.0/oa/user/detail?data={encodedData}";

                var response = await _httpClient.GetAsync(url);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    _logger.LogInformation("Got user info for {UserId}: {Response}", userId, responseContent);
                    
                    return responseContent;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to get user info for {UserId}. Status: {Status}, Error: {Error}", 
                        userId, response.StatusCode, errorContent);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while getting user info for {UserId}", userId);
                return null;
            }
        }
    }

    public class ZaloTokenResponse
    {
        public int Error { get; set; }
        public string? Message { get; set; }
        public ZaloTokenData? Data { get; set; }
    }

    public class ZaloTokenData
    {
        public string? AccessToken { get; set; }
        public int ExpiresIn { get; set; }
    }
} 