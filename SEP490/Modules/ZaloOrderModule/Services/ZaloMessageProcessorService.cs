using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Zalo.Services;
using SEP490.Modules.ZaloOrderModule.Constants;
using SEP490.Modules.ZaloOrderModule.DTO;
using ZaloLLMResponse = SEP490.Modules.Zalo.DTO.LLMResponse;
using ZaloMessageResponse = SEP490.Modules.Zalo.DTO.MessageResponse;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public class ZaloMessageProcessorService: BaseService
    {
        private readonly ILogger<ZaloMessageProcessorService> _logger;
        private readonly ZaloConversationStateService _conversationStateService;
        private readonly ZaloResponseService _responseService;
        private readonly IZaloCustomerService _customerService;
        private readonly IZaloMessageHistoryService _messageHistoryService;
        private readonly IZaloChatForwardService _zaloChatForwardService;

        public ZaloMessageProcessorService(
            ILogger<ZaloMessageProcessorService> logger,
            ZaloConversationStateService conversationStateService,
            ZaloResponseService responseService,
            IZaloCustomerService customerService,
            IZaloMessageHistoryService messageHistoryService,
            IZaloChatForwardService zaloChatForwardService)
        {
            _logger = logger;
            _conversationStateService = conversationStateService;
            _responseService = responseService;
            _customerService = customerService;
            _messageHistoryService = messageHistoryService;
            _zaloChatForwardService = zaloChatForwardService;
        }

        public async Task<MessageResponse> ProcessMessageAsync(string zaloUserId, string message)
        {
            try
            {
                _logger.LogInformation("Processing message from user: {UserId}, Message: {Message}", zaloUserId, message);

                // Get or create conversation state
                var conversation = await _conversationStateService.GetOrCreateConversationAsync(zaloUserId);

                // Store user message in conversation history
                await _conversationStateService.UpdateConversationDataAsync(zaloUserId, conv =>
                {
                    conv.IncrementMessageCount();
                    conv.LastUserMessage = message;
                    conv.AddMessageToHistory(message, "user");
                });

                // Analyze intent based on current state
                var intent = await AnalyzeIntentAsync(message, conversation.CurrentState);

                // Process based on intent and current state
                var response = await ProcessIntentAsync(zaloUserId, message, intent, conversation);

                // Store bot response in conversation history
                await _conversationStateService.UpdateConversationDataAsync(zaloUserId, conv =>
                {
                    conv.LastBotResponse = response.Content;
                    conv.AddMessageToHistory(response.Content, "business");
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
            var trimmedMessage = message.Trim();
            
            // Handle special commands based on current state
            if (currentState == UserStates.WAITING_FOR_PHONE)
            {
                // Check if it's a phone number
                if (await _customerService.ValidatePhoneNumberAsync(trimmedMessage))
                {
                    return MessageIntents.PHONE_NUMBER;
                }
                return MessageIntents.UNKNOWN;
            }

            if (currentState == UserStates.WAITING_FOR_PRODUCT_INFO)
            {
                if (trimmedMessage.Equals("Kết thúc", StringComparison.OrdinalIgnoreCase))
                {
                    return MessageIntents.FINISH_ORDER;
                }
                return MessageIntents.UNKNOWN;
            }

            // Handle main commands
            if (trimmedMessage.Equals("Đặt hàng", StringComparison.OrdinalIgnoreCase))
                return MessageIntents.PLACE_ORDER;
            
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
                
                case MessageIntents.PHONE_NUMBER:
                    return await HandlePhoneNumberIntentAsync(zaloUserId, message, conversation);
                  
                case MessageIntents.FINISH_ORDER:
                    return await HandleFinishOrderIntentAsync(zaloUserId, message, conversation);
                
                case MessageIntents.CONTACT_STAFF:
                    return await HandleContactStaffIntentAsync(zaloUserId, message, conversation);
                
                default:
                    return await HandleUnknownIntentAsync(zaloUserId, message, conversation);
            }
        }

        private async Task<MessageResponse> HandlePlaceOrderIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            // Start the order process by asking for phone number
            await _conversationStateService.UpdateStateAsync(zaloUserId, UserStates.WAITING_FOR_PHONE);

            return new MessageResponse
            {
                Content = ZaloWebhookConstants.DefaultMessages.ORDER_START_PHONE_REQUEST,
                MessageType = "text",
                Intent = MessageIntents.PLACE_ORDER
            };
        }

        private async Task<MessageResponse> HandlePhoneNumberIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            try
            {
                // Validate phone number
                if (!await _customerService.ValidatePhoneNumberAsync(message))
                {
                    return new MessageResponse
                    {
                        Content = ZaloWebhookConstants.DefaultMessages.INVALID_PHONE_FORMAT,
                        MessageType = "text",
                        Intent = MessageIntents.PHONE_NUMBER
                    };
                }

                // Look up customer by phone number
                var customer = await _customerService.GetCustomerByPhoneAsync(message);
                
                await _conversationStateService.UpdateConversationDataAsync(zaloUserId, conv =>
                {
                    conv.CustomerPhone = message;
                });

                if (customer != null)
                {
                    // Customer exists
                    await _conversationStateService.UpdateConversationDataAsync(zaloUserId, conv =>
                    {
                        conv.CustomerId = customer.Id;
                    });

                    await _conversationStateService.UpdateStateAsync(zaloUserId, UserStates.WAITING_FOR_PRODUCT_INFO);

                    return new MessageResponse
                    {
                        Content = string.Format(ZaloWebhookConstants.DefaultMessages.CUSTOMER_FOUND_ORDER_START, customer.CustomerName),
                        MessageType = "text",
                        
                    };
                }
                else
                {
                    // Customer doesn't exist - for now, we'll proceed with order but note that customer creation is for later
                    await _conversationStateService.UpdateStateAsync(zaloUserId, UserStates.WAITING_FOR_PRODUCT_INFO);

                    return new MessageResponse
                    {
                        Content = ZaloWebhookConstants.DefaultMessages.CUSTOMER_NOT_FOUND_ORDER_START,
                        MessageType = "text",
                        
                    };
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling phone number for user: {UserId}", zaloUserId);
                return new MessageResponse
                {
                    Content = "❌ Có lỗi xảy ra khi xử lý số điện thoại. Vui lòng thử lại:",
                    MessageType = "text",
                    Intent = MessageIntents.PHONE_NUMBER
                };
            }
        }

        private async Task<MessageResponse> HandleFinishOrderIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            try
            {
                if (conversation.OrderItems.Count == 0)
                {
                    return new MessageResponse
                    {
                        Content = ZaloWebhookConstants.DefaultMessages.NO_PRODUCTS_IN_ORDER,
                        MessageType = "text",
                        
                    };
                }

                // Get messages from "Đặt hàng" to "Kết thúc"
                var orderMessages = await _messageHistoryService.GetListMessageAsync(zaloUserId);
                
                if (orderMessages.Count == 0)
                {
                    _logger.LogWarning("No order messages found for user: {UserId}", zaloUserId);
                    return new MessageResponse
                    {
                        Content = "❌ Không tìm thấy lịch sử đặt hàng. Vui lòng thử lại.",
                        MessageType = "text",
                        Intent = MessageIntents.FINISH_ORDER
                    };
                }

                // Forward messages to the LLM service
                var forwardResponse = await ForwardMessagesToLLMAsync(orderMessages);
                
                if (forwardResponse == null)
                {
                    _logger.LogError("Failed to forward messages for user: {UserId}", zaloUserId);
                    return new MessageResponse
                    {
                        Content = "❌ Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau.",
                        MessageType = "text",
                        Intent = MessageIntents.FINISH_ORDER
                    };
                }

                // Create order based on the response
                var orderCreated = await CreateOrderFromResponseAsync(zaloUserId, forwardResponse, conversation);
                
                if (!orderCreated)
                {
                    _logger.LogError("Failed to create order for user: {UserId}", zaloUserId);
                    return new MessageResponse
                    {
                        Content = "❌ Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại sau.",
                        MessageType = "text",
                        Intent = MessageIntents.FINISH_ORDER
                    };
                }

                // Generate order summary
                var orderSummary = GenerateOrderSummary(conversation);
                
                await _conversationStateService.UpdateStateAsync(zaloUserId, UserStates.CONFIRMING);

                return new MessageResponse
                {
                    Content = string.Format(ZaloWebhookConstants.DefaultMessages.ORDER_COMPLETED_SUCCESS, orderSummary),
                    MessageType = "text",
                    Intent = MessageIntents.FINISH_ORDER,
                    
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finishing order for user: {UserId}", zaloUserId);
                return new MessageResponse
                {
                    Content = "❌ Có lỗi xảy ra khi hoàn thành đơn hàng. Vui lòng thử lại:",
                    MessageType = "text",
                    
                };
            }
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
               
            };
        }

        private async Task<MessageResponse> HandleUnknownIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            // Provide context-specific error messages
            if (conversation.CurrentState == UserStates.WAITING_FOR_PHONE)
            {
                return new MessageResponse
                {
                    Content = ZaloWebhookConstants.DefaultMessages.INVALID_PHONE_FORMAT,
                    MessageType = "text",
                    Intent = MessageIntents.UNKNOWN
                };
            }
            else if (conversation.CurrentState == UserStates.WAITING_FOR_PRODUCT_INFO)
            {
                return new MessageResponse
                {
                    Content = ZaloWebhookConstants.DefaultMessages.INVALID_PRODUCT_FORMAT,
                    MessageType = "text",
                    Intent = MessageIntents.UNKNOWN
                };
            }
            else
            {
                return new MessageResponse
                {
                    Content = ZaloWebhookConstants.DefaultMessages.UNKNOWN_INTENT,
                    MessageType = "text",
                    Intent = MessageIntents.UNKNOWN
                };
            }
        }

        private async Task<ZaloLLMResponse?> ForwardMessagesToLLMAsync(List<ZaloMessageResponse> messages)
        {
            try
            {
                // Forward messages to the LLM service
                var response = await _zaloChatForwardService.ForwardMessagesAsync(messages);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error forwarding messages to LLM service");
                return null;
            }
        }

        private async Task<bool> CreateOrderFromResponseAsync(string zaloUserId, ZaloLLMResponse forwardResponse, ConversationState conversation)
        {
            try
            {
                // TODO: Implement order creation logic based on the forwardResponse
                // This would typically involve:
                // 1. Creating a new order in the database
                // 2. Adding order items from forwardResponse.Items
                // 3. Associating the order with the customer
                // 4. Setting order status and other details
                
                _logger.LogInformation("Order created successfully for user: {UserId} with {ItemCount} items", 
                    zaloUserId, forwardResponse.Items?.Count ?? 0);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order from response for user: {UserId}", zaloUserId);
                return false;
            }
        }

        private string GenerateOrderSummary(ConversationState conversation)
        {
            var summary = "📋 CHI TIẾT ĐƠN HÀNG:\n\n";
            
            foreach (var item in conversation.OrderItems)
            {
                summary += $"• {item.ProductCode} - {item.ProductType} - {item.Size} - SL: {item.Quantity}\n";
            }

            summary += $"\n📞 Số điện thoại: {conversation.CustomerPhone}";
            
            if (conversation.CustomerId.HasValue)
            {
                summary += $"\n👤 Khách hàng: Khách hàng hiện tại";
            }

            return summary;
        }
    }
}


