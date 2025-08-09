using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.Modules.ZaloOrderModule.Constants;
using SEP490.Modules.ZaloOrderModule.DTO;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public class ZaloWebhookService : BaseService, IZaloWebhookService
    {
        private readonly SEP490DbContext _context;
        private readonly ILogger<ZaloWebhookService> _logger;
        private readonly IConfiguration _configuration;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ZaloMessageProcessorService _messageProcessor;
        private readonly ZaloConversationStateService _conversationStateService;
        private readonly ZaloResponseService _responseService;

        public ZaloWebhookService(
            SEP490DbContext sEP490DbContext,
            ILogger<ZaloWebhookService> logger,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ZaloMessageProcessorService messageProcessor,
            ZaloConversationStateService conversationStateService,
            ZaloResponseService responseService)
        {
            _context = sEP490DbContext;
            _logger = logger;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
            _messageProcessor = messageProcessor;
            _conversationStateService = conversationStateService;
            _responseService = responseService;
        }

        public async Task<ZaloWebhookResponse> ProcessWebhookAsync(ZaloWebhookRequest request)
        {
            try
            {
                _logger.LogInformation("Processing webhook event: {EventName} from user: {UserId}", 
                    request.EventName, request.Sender.Id);

                // Update user info in conversation state
                await _conversationStateService.UpdateUserInfoAsync(request.Sender.Id, request.Sender.Name, request.Sender.Avatar);

                switch (request.EventName.ToLower())
                {
                    case ZaloWebhookConstants.Events.USER_SEND_TEXT:
                        return await HandleTextMessageAsync(request);
                    default:
                        return await HandleNonTextEventAsync(request);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing webhook request");
                return new ZaloWebhookResponse { Status = "error", Message = "Internal server error" };
            }
        }

        private async Task<ZaloWebhookResponse> HandleTextMessageAsync(ZaloWebhookRequest request)
        {
            if (request.Message?.Text == null)
            {
                return new ZaloWebhookResponse { Status = "error", Message = "No text content" };
            }

            // Xử lý tin nhắn text
            var response = await _messageProcessor.ProcessMessageAsync(request.Sender.Id, request.Message.Text);

            // Gửi phản hồi về Zalo
            await SendMessageToZaloAsync(request.Sender.Id, response.Content);

            return new ZaloWebhookResponse { Status = "success", Message = "Text message processed" };
        }

        private async Task<ZaloWebhookResponse> HandleNonTextEventAsync(ZaloWebhookRequest request)
        {
            _logger.LogWarning("Received non-text webhook event: {EventName} from user: {UserId} at {Timestamp}", 
                request.EventName, request.Sender.Id, DateTime.UtcNow);

            // Lấy tin nhắn phản hồi cho sự kiện không được hỗ trợ
            var response = await _responseService.GetUnsupportedEventResponseAsync();

            // Gửi tin nhắn thông báo cho người dùng
            var messageSent = await SendMessageToZaloAsync(request.Sender.Id, response.Content);

            if (messageSent)
            {
                _logger.LogInformation("Sent unsupported event notification to user: {UserId} for event: {EventName}", 
                    request.Sender.Id, request.EventName);
            }
            else
            {
                _logger.LogError("Failed to send unsupported event notification to user: {UserId} for event: {EventName}", 
                    request.Sender.Id, request.EventName);
            }

            return new ZaloWebhookResponse 
            { 
                Status = "ignored", 
                Message = $"Event type '{request.EventName}' not supported - only text messages are handled" 
            };
        }

        
        public async Task<bool> SendMessageToZaloAsync(string recipientId, string message)
        {
            try
            {
                var token = await _context.ZaloTokens.FirstOrDefaultAsync();
                if (token == null)
                    throw new Exception("loi");
                // Refresh access token if expired
                //if (token.AccessTokenExpiresAt <= DateTime.UtcNow)
                //{
                //    var refreshed = await RefreshZaloTokenAsync(token);
                //    if (!refreshed)
                //        throw new Exception("loi");
                //}

                //var accessToken = await GetAccessTokenAsync();
                //if (string.IsNullOrEmpty(accessToken))
                //{
                //    _logger.LogError("Failed to get Zalo access token");
                //    return false;
                //}

                var sendRequest = new ZaloSendMessageRequest
                {
                    Recipient = new ZaloRecipient { Id = recipientId },
                    Message = new ZaloSendMessage { Text = message }
                };

                var client = _httpClientFactory.CreateClient();
                // client.DefaultRequestHeaders.Add("access_token", token.AccessToken);
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);
                var accesstoken = token.AccessToken;
                var json = JsonSerializer.Serialize(sendRequest);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                var response = await client.PostAsync("https://openapi.zalo.me/v3.0/oa/message/cs", content);
                
                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var sendResponse = JsonSerializer.Deserialize<ZaloSendMessageResponse>(responseContent);
                    _logger.LogInformation("Message sent successfully to user: {UserId}, MessageId: {MessageId}", 
                        recipientId, sendResponse?.MessageId);
                    return true;
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    var errorResponse = JsonSerializer.Deserialize<ZaloErrorResponse>(errorContent);
                    _logger.LogError("Failed to send message to user {UserId}. Error: {Error}, Message: {Message}", 
                        recipientId, errorResponse?.Error, errorResponse?.Message);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message to Zalo for user: {UserId}", recipientId);
                return false;
            }
        }
        //private async Task<string?> GetAccessTokenAsync()
        //{
        //    var token = await _context.ZaloTokens.FirstOrDefaultAsync();
        //    if (token == null)
        //        throw new Exception("loi");

        //    // Refresh access token if expired
        //    //if (token.AccessTokenExpiresAt <= DateTime.UtcNow)
        //    //{
        //    //    var refreshed = await RefreshZaloTokenAsync(token);
        //    //    if (!refreshed)
        //    //        throw new Exception("loi");
        //    //}
        //    return token;
        //}
    }
}

