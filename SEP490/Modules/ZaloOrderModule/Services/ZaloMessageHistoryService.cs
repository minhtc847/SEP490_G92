using Microsoft.Extensions.Logging;
using SEP490.Modules.Zalo.DTO;
using SEP490.Modules.ZaloOrderModule.DTO;
using ZaloMessageResponse = SEP490.Modules.Zalo.DTO.MessageResponse;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public class ZaloMessageHistoryService : IZaloMessageHistoryService
    {
        private readonly ILogger<ZaloMessageHistoryService> _logger;
        private readonly ZaloConversationStateService _conversationStateService;

        public ZaloMessageHistoryService(
            ILogger<ZaloMessageHistoryService> logger,
            ZaloConversationStateService conversationStateService)
        {
            _logger = logger;
            _conversationStateService = conversationStateService;
        }

        public async Task<List<ZaloMessageResponse>> GetListMessageAsync(string zaloUserId)
        {
            try
            {
                _logger.LogInformation("Retrieving message history for user: {UserId}", zaloUserId);

                // Get the conversation state
                var conversation = await _conversationStateService.GetConversationAsync(zaloUserId);
                if (conversation == null)
                {
                    _logger.LogWarning("No conversation found for user: {UserId}", zaloUserId);
                    return new List<ZaloMessageResponse>();
                }

                // Get messages from conversation history
                var messages = new List<ZaloMessageResponse>();
                var orderStartIndex = -1;
                var orderEndIndex = -1;

                // Find the start and end indices of the order conversation
                for (int i = 0; i < conversation.MessageHistory.Count; i++)
                {
                    var message = conversation.MessageHistory[i];
                    
                    // Look for "Đặt hàng" message (case-insensitive)
                    if (orderStartIndex == -1 && 
                        message.SenderType == "user" && 
                        message.Content.Trim().Equals("Đặt hàng", StringComparison.OrdinalIgnoreCase))
                    {
                        orderStartIndex = i;
                        _logger.LogInformation("Found order start at index {Index} for user: {UserId}", i, zaloUserId);
                    }
                    
                    // Look for "Kết thúc" message (case-insensitive)
                    if (orderStartIndex != -1 && 
                        message.SenderType == "user" && 
                        message.Content.Trim().Equals("Kết thúc", StringComparison.OrdinalIgnoreCase))
                    {
                        orderEndIndex = i;
                        _logger.LogInformation("Found order end at index {Index} for user: {UserId}", i, zaloUserId);
                        break;
                    }
                }

                // If we found both start and end, extract the messages
                if (orderStartIndex != -1 && orderEndIndex != -1)
                {
                    for (int i = orderStartIndex; i <= orderEndIndex; i++)
                    {
                        var message = conversation.MessageHistory[i];
                        messages.Add(new ZaloMessageResponse
                        {
                            SenderId = zaloUserId,
                            UserType = message.SenderType,
                            MessageType = message.MessageType,
                            MessageContent = message.Content,
                            SendTime = message.Timestamp
                        });
                    }

                    _logger.LogInformation("Retrieved {Count} messages from order conversation for user: {UserId}", 
                        messages.Count, zaloUserId);
                }
                else
                {
                    _logger.LogWarning("Order conversation not found (start: {Start}, end: {End}) for user: {UserId}", 
                        orderStartIndex, orderEndIndex, zaloUserId);
                }

                return messages;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving message history for user: {UserId}", zaloUserId);
                return new List<ZaloMessageResponse>();
            }
        }
    }
}
