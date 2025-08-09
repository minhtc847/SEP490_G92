using Microsoft.Extensions.Logging;
using SEP490.Modules.ZaloOrderModule.DTO;

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
            var lowerMessage = message.ToLower();
            
            // Intent recognition based on keywords and current state
            if (lowerMessage.Contains("đặt hàng") || lowerMessage.Contains("order") || lowerMessage.Contains("mua"))
                return MessageIntents.PLACE_ORDER;
            
            if (lowerMessage.Contains("kết thúc") || lowerMessage.Contains("xác nhận") || lowerMessage.Contains("confirm"))
                return MessageIntents.CONFIRM_ORDER;
            
            if (lowerMessage.Contains("hủy") || lowerMessage.Contains("cancel") || lowerMessage.Contains("thôi"))
                return MessageIntents.CANCEL_ORDER;
            
            if (lowerMessage.Contains("sản phẩm") || lowerMessage.Contains("product") || lowerMessage.Contains("hàng"))
                return MessageIntents.INQUIRE_PRODUCT;
            
            if (lowerMessage.Contains("giá") || lowerMessage.Contains("price") || lowerMessage.Contains("bao nhiêu"))
                return MessageIntents.INQUIRE_PRICE;
            
            if (lowerMessage.Contains("xin chào") || lowerMessage.Contains("hello") || lowerMessage.Contains("hi"))
                return MessageIntents.GREETING;
            
            if (lowerMessage.Contains("tạm biệt") || lowerMessage.Contains("goodbye") || lowerMessage.Contains("bye"))
                return MessageIntents.GOODBYE;
                
            return MessageIntents.UNKNOWN;
        }

        private async Task<MessageResponse> ProcessIntentAsync(string zaloUserId, string message, string intent, ConversationState conversation)
        {
            switch (intent)
            {
                case MessageIntents.PLACE_ORDER:
                    return await HandlePlaceOrderIntentAsync(zaloUserId, message, conversation);
                
                case MessageIntents.CONFIRM_ORDER:
                    return await HandleConfirmOrderIntentAsync(zaloUserId, message, conversation);
                
                case MessageIntents.CANCEL_ORDER:
                    return await HandleCancelOrderIntentAsync(zaloUserId, message, conversation);
                
                case MessageIntents.INQUIRE_PRODUCT:
                    return await HandleInquireProductIntentAsync(zaloUserId, message, conversation);
                
                case MessageIntents.INQUIRE_PRICE:
                    return await HandleInquirePriceIntentAsync(zaloUserId, message, conversation);
                
                case MessageIntents.GREETING:
                    return await HandleGreetingIntentAsync(zaloUserId, message, conversation);
                
                case MessageIntents.GOODBYE:
                    return await HandleGoodbyeIntentAsync(zaloUserId, message, conversation);
                
                default:
                    return await HandleUnknownIntentAsync(zaloUserId, message, conversation);
            }
        }

        private async Task<MessageResponse> HandlePlaceOrderIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            if (conversation.CurrentState == UserStates.INQUIRY)
            {
                await _conversationStateService.UpdateStateAsync(zaloUserId, UserStates.ORDERING);
                
                return new MessageResponse
                {
                    Content = "Bạn đã bắt đầu quá trình đặt hàng. Vui lòng cung cấp thông tin sản phẩm bạn muốn đặt.",
                    MessageType = "text",
                    Intent = MessageIntents.PLACE_ORDER,
                    Suggestions = new List<string> { "Kính cường lực", "Kính an toàn", "Kính phản quang" }
                };
            }
            
            return new MessageResponse
            {
                Content = "Bạn đang trong quá trình đặt hàng. Vui lòng hoàn thành thông tin hoặc gõ 'kết thúc' để xác nhận.",
                MessageType = "text",
                Intent = MessageIntents.PLACE_ORDER
            };
        }

        private async Task<MessageResponse> HandleConfirmOrderIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            if (conversation.CurrentState == UserStates.ORDERING)
            {
                await _conversationStateService.UpdateStateAsync(zaloUserId, UserStates.CONFIRMING);
                
                return new MessageResponse
                {
                    Content = "Đơn hàng của bạn đã được xác nhận! Chúng tôi sẽ liên hệ sớm nhất.",
                    MessageType = "text",
                    Intent = MessageIntents.CONFIRM_ORDER,
                    ShouldEndConversation = true
                };
            }
            
            return new MessageResponse
            {
                Content = "Bạn chưa có đơn hàng nào để xác nhận. Vui lòng gõ 'đặt hàng' để bắt đầu.",
                MessageType = "text",
                Intent = MessageIntents.CONFIRM_ORDER
            };
        }

        private async Task<MessageResponse> HandleCancelOrderIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            await _conversationStateService.UpdateStateAsync(zaloUserId, UserStates.CANCELLED);
            
            return new MessageResponse
            {
                Content = "Đơn hàng đã được hủy. Cảm ơn bạn đã quan tâm!",
                MessageType = "text",
                Intent = MessageIntents.CANCEL_ORDER,
                ShouldEndConversation = true
            };
        }

        private async Task<MessageResponse> HandleInquireProductIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            return new MessageResponse
            {
                Content = "Chúng tôi có các loại kính: Kính cường lực, Kính an toàn, Kính phản quang. Bạn quan tâm loại nào?",
                MessageType = "text",
                Intent = MessageIntents.INQUIRE_PRODUCT,
                Suggestions = new List<string> { "Kính cường lực", "Kính an toàn", "Kính phản quang", "Đặt hàng" }
            };
        }

        private async Task<MessageResponse> HandleInquirePriceIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            return new MessageResponse
            {
                Content = "Giá cả phụ thuộc vào loại kính và kích thước. Vui lòng cho biết bạn cần loại kính nào?",
                MessageType = "text",
                Intent = MessageIntents.INQUIRE_PRICE,
                Suggestions = new List<string> { "Kính cường lực", "Kính an toàn", "Kính phản quang" }
            };
        }

        private async Task<MessageResponse> HandleGreetingIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            return new MessageResponse
            {
                Content = "Xin chào! Chào mừng bạn đến với VNG Glass. Bạn có thể gõ 'đặt hàng' để bắt đầu quá trình đặt hàng.",
                MessageType = "text",
                Intent = MessageIntents.GREETING,
                Suggestions = new List<string> { "Đặt hàng", "Xem sản phẩm", "Hỏi giá" }
            };
        }

        private async Task<MessageResponse> HandleGoodbyeIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            return new MessageResponse
            {
                Content = "Tạm biệt! Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.",
                MessageType = "text",
                Intent = MessageIntents.GOODBYE,
                ShouldEndConversation = true
            };
        }

        private async Task<MessageResponse> HandleUnknownIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            return new MessageResponse
            {
                Content = "Xin lỗi, tôi không hiểu ý bạn. Bạn có thể gõ 'đặt hàng' để bắt đầu quá trình đặt hàng hoặc 'xin chào' để được hướng dẫn.",
                MessageType = "text",
                Intent = MessageIntents.UNKNOWN,
                Suggestions = new List<string> { "Đặt hàng", "Xin chào", "Xem sản phẩm" }
            };
        }
    }
}


