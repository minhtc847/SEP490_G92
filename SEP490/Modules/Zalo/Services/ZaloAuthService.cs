using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.SalesOrder.ManageSalesOrder.Services;
using SEP490.Modules.Zalo.Constants;
using SEP490.Modules.Zalo.DTO;
using System.Net.Http.Headers;
using System.Net.Http;
using System.Text.Json;
using System.Globalization;

namespace SEP490.Modules.Zalo.Services
{
    public class ZaloAuthService : BaseService, IZaloAuthService
    {
        private readonly SEP490DbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _config;
        public ZaloAuthService(SEP490DbContext sEP490DbContext, IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            _context = sEP490DbContext;
            _httpClientFactory = httpClientFactory;
            _config = config;
        }
        public void StoreDevAccessToken(string accessToken, string refreshToken)
        {
            ZaloToken zaloToken = new ZaloToken
            {
                AccessToken = accessToken,
                AccessTokenExpiresAt = DateTime.Now.AddSeconds(ZaloTokenExprireTime.AccessTokenExprireTime),
                RefreshToken = refreshToken,
                RefreshTokenExpiresAt = DateTime.Now.AddSeconds(ZaloTokenExprireTime.RefreshTokenExprireTime)
            };

            try
            {
                _context.ZaloTokens.Add(zaloToken);
                _context.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error saving token: {ex.Message}");
            }

        }
        public async Task<List<MessageResponse>> getListMessageFromUser(string userId)
        {
            var token = await _context.ZaloTokens.FirstOrDefaultAsync();
            if (token == null)
                throw new Exception("loi");

            // Refresh access token if expired
            if (token.AccessTokenExpiresAt <= DateTime.UtcNow)
            {
                var refreshed = await RefreshZaloTokenAsync(token);
                if (!refreshed)
                    throw new Exception("loi");
            }

            // Prepare HTTP client
            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("access_token", token.AccessToken);

            // Prepare request data
            var requestData = new
            {
                offset = 0,
                user_id = userId,
                count = 10
            };
            var json = JsonSerializer.Serialize(requestData);
            var encodedData = Uri.EscapeDataString(json);

            var url = $"https://openapi.zalo.me/v2.0/oa/conversation?data={encodedData}";
            var response = await client.GetAsync(url);

            if (!response.IsSuccessStatusCode)
                throw new Exception("loi");

            var content = await response.Content.ReadAsStringAsync();
            using var jsonDoc = JsonDocument.Parse(content);

            if (!jsonDoc.RootElement.TryGetProperty("data", out var dataElement) || dataElement.ValueKind != JsonValueKind.Array)
                throw new Exception("Dữ liệu không hợp lệ từ API Zalo");

            var messages = new List<MessageResponse>();

            foreach (var item in dataElement.EnumerateArray())
            {
                var message = new MessageResponse
                {
                    SenderId = item.GetProperty("from_id").GetString(),

                    UserType = item.GetProperty("from_display_name").GetString() == "Glass JSC" ? "business" : "user",

                    MessageType = item.GetProperty("type").GetString(),

                    MessageContent = item.TryGetProperty("message", out var msgContent)
                        ? msgContent.GetString()
                        : null,
                    SendTime = DateTime.ParseExact(
                        item.GetProperty("sent_time").GetString()!,
                        "HH:mm:ss dd/MM/yyyy",
                        CultureInfo.InvariantCulture)
                };

                messages.Add(message);
            }

            return messages;
        }
        private async Task<bool> RefreshZaloTokenAsync(ZaloToken token)
        {
            var client = _httpClientFactory.CreateClient();

            var data = new Dictionary<string, string>
            {
                ["grant_type"] = "refresh_token",
                ["refresh_token"] = token.RefreshToken,
                ["app_id"] = _config["Zalo:AppId"],
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "https://oauth.zaloapp.com/v4/oa/access_token")
            {
                Content = new FormUrlEncodedContent(data)
            };

            request.Headers.Add("secret_key", _config["Zalo:AppSecret"]);

            var response = await client.SendAsync(request);
            if (!response.IsSuccessStatusCode) return false;

            var content = await response.Content.ReadAsStringAsync();
            var json = JsonDocument.Parse(content);

            var accessToken = json.RootElement.GetProperty("access_token").GetString();
            var refreshToken = json.RootElement.GetProperty("refresh_token").GetString();
            var expiresIn = json.RootElement.GetProperty("expires_in").GetInt32();

            token.AccessToken = accessToken!;
            token.AccessTokenExpiresAt = DateTime.UtcNow.AddSeconds(ZaloTokenExprireTime.AccessTokenExprireTime);
            token.RefreshToken = refreshToken!;
            token.RefreshTokenExpiresAt = DateTime.UtcNow.AddSeconds(ZaloTokenExprireTime.RefreshTokenExprireTime);

            _context.ZaloTokens.Update(token);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ZaloUserDetailResponse> GetUserDetailByIdAsync(string userId)
        {
            var token = await _context.ZaloTokens.FirstOrDefaultAsync();
            if (token == null)
                throw new Exception("No Zalo access token found.");

            // Refresh access token if expired
            if (token.AccessTokenExpiresAt <= DateTime.UtcNow)
            {
                var refreshed = await RefreshZaloTokenAsync(token);
                if (!refreshed)
                    throw new Exception("Failed to refresh Zalo access token.");
            }

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Add("access_token", token.AccessToken);

            var requestData = new { user_id = userId };
            var json = JsonSerializer.Serialize(requestData);
            var encodedData = Uri.EscapeDataString(json);

            var url = $"https://openapi.zalo.me/v3.0/oa/user/detail?data={encodedData}";
            var response = await client.GetAsync(url);

            if (!response.IsSuccessStatusCode)
                throw new Exception("Failed to get user detail from Zalo API.");

            var content = await response.Content.ReadAsStringAsync();
            using var jsonDoc = JsonDocument.Parse(content);

            if (!jsonDoc.RootElement.TryGetProperty("data", out var dataElement))
                throw new Exception("Invalid response from Zalo API.");

            var userDetail = JsonSerializer.Deserialize<ZaloUserDetailResponse>(dataElement.GetRawText());
            if (userDetail == null)
                throw new Exception("Failed to parse user detail.");

            return userDetail;
        }


    }
}
