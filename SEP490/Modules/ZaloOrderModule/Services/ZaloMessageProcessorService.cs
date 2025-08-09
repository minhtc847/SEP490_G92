using Microsoft.Extensions.Logging;
using SEP490.Modules.ZaloOrderModule.DTO;
using SEP490.Modules.ZaloOrderModule.Constants;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public class ZaloMessageProcessorService
    {
        private readonly ILogger<ZaloMessageProcessorService> _logger;
        private readonly ZaloConversationStateService _conversationStateService;
        private readonly ZaloResponseService _responseService;

        public ZaloMessageProcessorService(
            ILogger<ZaloMessageProcessorService> logger,
            ZaloConversationStateService conversationStateService,
            ZaloResponseService responseService)
        {
            _logger = logger;
            _conversationStateService = conversationStateService;
            _responseService = responseService;
        }

        public async Task<MessageResponse> ProcessMessageAsync(string zaloUserId, string message)
        {
            try
            {
                _logger.LogInformation("Processing message from user: {UserId}, Message: {Message}", zaloUserId, message);

                // Get or create conversation state
                var conversation = await _conversationStateService.GetOrCreateConversationAsync(zaloUserId);

                // Update conversation data
                await _conversationStateService.UpdateConversationDataAsync(zaloUserId, conv =>
                {
                    conv.IncrementMessageCount();
                    conv.LastUserMessage = message;
                });

                // Analyze intent
                var intent = await AnalyzeIntentAsync(message, conversation.CurrentState);

                // Process based on intent and current state
                var response = await ProcessIntentAsync(zaloUserId, message, intent, conversation);

                // Update bot response
                await _conversationStateService.UpdateConversationDataAsync(zaloUserId, conv =>
                {
                    conv.LastBotResponse = response.Content;
                });

                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing message for user: {UserId}", zaloUserId);
                
                await _conversationStateService.UpdateConversationDataAsync(zaloUserId, conv =>
                {
                    conv.LastError = ex.Message;
                    conv.RetryCount++;
                });

                return new MessageResponse
                {
                    Content = "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
                    MessageType = "text",
                    Intent = MessageIntents.UNKNOWN
                };
            }
        }


        private async Task<string> AnalyzeIntentAsync(string message, string currentState)
        {
            // Chỉ xử lý đúng text, không phân biệt hoa thường
            var trimmedMessage = message.Trim();
            
            // Chỉ xử lý 4 lệnh chính với text chính xác
            if (trimmedMessage.Equals("Đặt hàng", StringComparison.OrdinalIgnoreCase))
                return MessageIntents.PLACE_ORDER;
            
            if (trimmedMessage.Equals("Đơn hàng", StringComparison.OrdinalIgnoreCase))
                return MessageIntents.CHECK_ORDER;
            
            if (trimmedMessage.Equals("Sản phẩm", StringComparison.OrdinalIgnoreCase))
                return MessageIntents.PRODUCT_INFO;
            
            if (trimmedMessage.Equals("Nhân viên", StringComparison.OrdinalIgnoreCase))
                return MessageIntents.CONTACT_STAFF;
                
            return MessageIntents.UNKNOWN;
        }

        private async Task<MessageResponse> ProcessIntentAsync(string zaloUserId, string message, string intent, ConversationState conversation)
        {
            switch (intent)
            {
                case MessageIntents.PLACE_ORDER:
                    return await HandlePlaceOrderIntentAsync(zaloUserId, message, conversation);
                
                case MessageIntents.CHECK_ORDER:
                    return await HandleCheckOrderIntentAsync(zaloUserId, message, conversation);
                
                case MessageIntents.PRODUCT_INFO:
                    return await HandleProductInfoIntentAsync(zaloUserId, message, conversation);
                
                case MessageIntents.CONTACT_STAFF:
                    return await HandleContactStaffIntentAsync(zaloUserId, message, conversation);
                
                default:
                    return await HandleUnknownIntentAsync(zaloUserId, message, conversation);
            }
        }

        private async Task<MessageResponse> HandlePlaceOrderIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            await _conversationStateService.UpdateStateAsync(zaloUserId, UserStates.ORDERING);
            
            return new MessageResponse
            {
                Content = "🎉 Bạn đã bắt đầu quá trình đặt hàng!\n\n" +
                         "Vui lòng cung cấp thông tin sau:\n" +
                         "• Loại kính bạn muốn đặt\n" +
                         "• Kích thước (dài x rộng)\n" +
                         "• Số lượng\n" +
                         "• Địa chỉ lắp đặt\n\n" +
                         "Nhân viên sẽ liên hệ với bạn trong vòng 30 phút để xác nhận đơn hàng.",
                MessageType = "text",
                Intent = MessageIntents.PLACE_ORDER,
                ShouldEndConversation = true
            };
        }

        private async Task<MessageResponse> HandleCheckOrderIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            return new MessageResponse
            {
                Content = "📋 Thông tin đơn hàng của bạn:\n\n" +
                         "🔍 Để kiểm tra trạng thái đơn hàng, vui lòng:\n" +
                         "• Cung cấp mã đơn hàng (nếu có)\n" +
                         "• Hoặc số điện thoại đặt hàng\n\n" +
                         "Nhân viên sẽ kiểm tra và phản hồi trong vòng 15 phút.",
                MessageType = "text",
                Intent = MessageIntents.CHECK_ORDER,
                ShouldEndConversation = true
            };
        }

        private async Task<MessageResponse> HandleProductInfoIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            return new MessageResponse
            {
                Content = "🏢 VNG Glass - Chuyên cung cấp các loại kính chất lượng cao:\n\n" +
                         "🔹 KÍNH CƯỜNG LỰC\n" +
                         "• Chống va đập, an toàn cao\n" +
                         "• Phù hợp: Cửa, vách ngăn, lan can\n" +
                         "• Độ dày: 8mm, 10mm, 12mm\n\n" +
                         "🔹 KÍNH AN TOÀN\n" +
                         "• Chống vỡ, bảo vệ tối ưu\n" +
                         "• Phù hợp: Mái che, cửa sổ cao\n" +
                         "• Độ dày: 6mm, 8mm, 10mm\n\n" +
                         "🔹 KÍNH PHẢN QUANG\n" +
                         "• Chống nắng, tiết kiệm năng lượng\n" +
                         "• Phù hợp: Văn phòng, nhà ở\n" +
                         "• Màu sắc: Xanh, xám, đồng\n\n" +
                         "🔹 KÍNH CÁCH ÂM\n" +
                         "• Giảm tiếng ồn hiệu quả\n" +
                         "• Phù hợp: Phòng họp, studio\n" +
                         "• Độ dày: 10mm, 12mm, 15mm\n\n" +
                         "💡 Gõ \"Đặt hàng\" để bắt đầu đặt hàng ngay!",
                MessageType = "text",
                Intent = MessageIntents.PRODUCT_INFO
            };
        }

        private async Task<MessageResponse> HandleContactStaffIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            return new MessageResponse
            {
                Content = "👨‍💼 Liên hệ nhân viên hỗ trợ:\n\n" +
                         "📞 Hotline: 1900-xxxx\n" +
                         "📧 Email: support@vngglass.com\n" +
                         "💬 Zalo: @vngglass_support\n" +
                         "🌐 Website: www.vngglass.com\n\n" +
                         "⏰ Giờ làm việc:\n" +
                         "• Thứ 2 - Thứ 6: 8:00 - 18:00\n" +
                         "• Thứ 7: 8:00 - 12:00\n" +
                         "• Chủ nhật: Nghỉ\n\n" +
                         "Nhân viên sẽ phản hồi trong vòng 15 phút!",
                MessageType = "text",
                Intent = MessageIntents.CONTACT_STAFF,
                ShouldEndConversation = true
            };
        }

        private async Task<MessageResponse> HandleUnknownIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            return new MessageResponse
            {
                Content = ZaloWebhookConstants.DefaultMessages.UNKNOWN_INTENT,
                MessageType = "text",
                Intent = MessageIntents.UNKNOWN
            };
        }
    }
}


