using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Zalo.DTO;
using ZaloMessageResponse = SEP490.Modules.Zalo.DTO.MessageResponse;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public class ZaloMessageHistoryService : BaseService, IZaloMessageHistoryService
    {
        private readonly ILogger<ZaloMessageHistoryService> _logger;
        private readonly SEP490DbContext _context;

        public ZaloMessageHistoryService(
            ILogger<ZaloMessageHistoryService> logger,
            SEP490DbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<List<ZaloMessageResponse>> GetListMessageAsync(string zaloUserId)
        {
            try
            {
                _logger.LogInformation("Retrieving message history for user: {UserId}", zaloUserId);

                // Get the conversation state with message history
                var conversation = await _context.ZaloConversationStates
                    .Include(cs => cs.MessageHistory.OrderBy(m => m.Timestamp))
                    .FirstOrDefaultAsync(cs => cs.ZaloUserId == zaloUserId && cs.IsActive);

                if (conversation == null)
                {
                    _logger.LogWarning("No conversation found for user: {UserId}", zaloUserId);
                    return new List<ZaloMessageResponse>();
                }

                // Get messages from conversation history
                var messages = new List<ZaloMessageResponse>();
                var orderStartIndex = -1;
                var orderEndIndex = -1;

                var messageList = conversation.MessageHistory.ToList();

                // Find the start and end indices of the order conversation
                for (int i = 0; i < messageList.Count; i++)
                {
                    var message = messageList[i];
                    
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
                        var message = messageList[i];
                        messages.Add(new ZaloMessageResponse
                        {
                            SenderId = zaloUserId,
                            SenderType = message.SenderType,
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
