using SEP490.Common.Services;
using SEP490.DB.Models;
using SEP490.Modules.Zalo.Services;
using SEP490.Modules.ZaloOrderModule.Constants;
using SEP490.Modules.ZaloOrderModule.DTO;
using ZaloLLMResponse = SEP490.Modules.Zalo.DTO.LLMResponse;
using ZaloMessageResponse = SEP490.Modules.Zalo.DTO.MessageResponse;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public interface IZaloMessageProcessorService
    {
        Task<MessageResponse> ProcessMessageAsync(string zaloUserId, string message);
    }

    public class ZaloMessageProcessorService: BaseTransientService, IZaloMessageProcessorService
    {
        private readonly ILogger<ZaloMessageProcessorService> _logger;
        private readonly IZaloConversationStateService _conversationStateService;
        private readonly IZaloResponseService _responseService;
        private readonly IZaloCustomerService _customerService;
        private readonly IZaloMessageHistoryService _messageHistoryService;
        private readonly IZaloChatForwardService _zaloChatForwardService;
        private readonly IZaloPriceCalculationService _priceCalculationService;
        private readonly IZaloOrderService _zaloOrderService;

        public ZaloMessageProcessorService(
            ILogger<ZaloMessageProcessorService> logger,
            IZaloConversationStateService conversationStateService,
            IZaloResponseService responseService,
            IZaloCustomerService customerService,
            IZaloMessageHistoryService messageHistoryService,
            IZaloChatForwardService zaloChatForwardService,
            IZaloPriceCalculationService priceCalculationService,
            IZaloOrderService zaloOrderService)
        {
            _logger = logger;
            _conversationStateService = conversationStateService;
            _responseService = responseService;
            _customerService = customerService;
            _messageHistoryService = messageHistoryService;
            _zaloChatForwardService = zaloChatForwardService;
            _priceCalculationService = priceCalculationService;
            _zaloOrderService = zaloOrderService;
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

            // Handle main commands - CANCEL can be used from any state
            if (trimmedMessage.Equals("Hủy", StringComparison.OrdinalIgnoreCase) ||
                trimmedMessage.Equals("Cancel", StringComparison.OrdinalIgnoreCase) ||
                trimmedMessage.Equals("Thôi", StringComparison.OrdinalIgnoreCase))
                return MessageIntents.CANCEL;

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
                return MessageIntents.ADD_ORDER_DETAIL;
            }

            // Handle confirmation intent when in CONFIRMING state
            if (currentState == UserStates.CONFIRMING)
            {
                if (trimmedMessage.Equals("Xác nhận", StringComparison.OrdinalIgnoreCase) ||
                    trimmedMessage.Equals("Xac nhan", StringComparison.OrdinalIgnoreCase) ||
                    trimmedMessage.Equals("Ok", StringComparison.OrdinalIgnoreCase) ||
                    trimmedMessage.Equals("Đồng ý", StringComparison.OrdinalIgnoreCase) ||
                    trimmedMessage.Equals("Dong y", StringComparison.OrdinalIgnoreCase))
                {
                    return MessageIntents.CONFIRM_ORDER;
                }
            }
        
            
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
                  
                case MessageIntents.ADD_ORDER_DETAIL:
                    return new MessageResponse
                    {
                        Content = ZaloWebhookConstants.DefaultMessages.ASK_CONFIRM_ORDER,
                        MessageType = "text",
                        Intent = MessageIntents.ADD_ORDER_DETAIL
                    };

                case MessageIntents.FINISH_ORDER:
                    return await HandleFinishOrderIntentAsync(zaloUserId, message, conversation);

                case MessageIntents.CONFIRM_ORDER:
                    return await HandleConFirmOrderIntentAsync(zaloUserId, message, conversation);

                case MessageIntents.CONTACT_STAFF:
                    return await HandleContactStaffIntentAsync(zaloUserId, message, conversation);
                
                case MessageIntents.CANCEL:
                    return await HandleCancelIntentAsync(zaloUserId, message, conversation);
                
                default:
                    return await HandleUnknownIntentAsync(zaloUserId, message, conversation);
            }
        }
        private async Task<MessageResponse> HandleConFirmOrderIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            try
            {
                _logger.LogInformation("Handling confirm order intent for user: {UserId}", zaloUserId);

                // Check if conversation has order items
                if (!conversation.OrderItems.Any())
                {
                    return new MessageResponse
                    {
                        Content = "Bạn chưa có sản phẩm nào trong đơn hàng. Vui lòng thêm sản phẩm trước khi xác nhận.",
                        MessageType = "text",
                        Intent = MessageIntents.CONFIRM_ORDER
                    };
                }

                // Check if customer phone is available
                if (string.IsNullOrEmpty(conversation.CustomerPhone))
                {
                    return new MessageResponse
                    {
                        Content = "Vui lòng cung cấp số điện thoại để chúng tôi có thể liên hệ xác nhận đơn hàng.",
                        MessageType = "text",
                        Intent = MessageIntents.PHONE_NUMBER
                    };
                }

                // Generate order code
                var orderCode = $"ZO{DateTime.Now:yyyyMMddHHmmss}";

                // Calculate total amount
                var totalAmount = conversation.OrderItems.Sum(item => item.TotalPrice);

                // Create order details
                var orderDetails = conversation.OrderItems.Select(item => new CreateZaloOrderDetailDTO
                {
                    ProductName = $"{item.ProductCode} - {item.ProductType} - {item.Width}x{item.Height}x{item.Thickness}mm",
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice = item.TotalPrice
                }).ToList();

                // Get customer information by phone number
                var customer = await _customerService.GetCustomerByPhoneAsync(conversation.CustomerPhone);
                var customerName = customer?.CustomerName ?? "Chưa có thông tin";
                var customerAddress = customer?.Address ?? "Chưa có thông tin";

                // Create Zalo order
                var createOrderDto = new CreateZaloOrderDTO
                {
                    OrderCode = orderCode,
                    ZaloUserId = zaloUserId,
                    CustomerName = customerName,
                    CustomerPhone = conversation.CustomerPhone,
                    CustomerAddress = customerAddress, // Will be updated when customer provides address
                    OrderDate = DateTime.Now,
                    TotalAmount = totalAmount,
                    Status = "Pending",
                    Note = $"Đơn hàng từ Zalo - User ID: {zaloUserId}",
                    ZaloOrderDetails = orderDetails
                };

                var createdOrder = await _zaloOrderService.CreateZaloOrderAsync(createOrderDto);

                // Update conversation state to completed
                await _conversationStateService.UpdateConversationStateAsync(zaloUserId, UserStates.COMPLETED);

                // Generate order summary
                var orderSummary = await GenerateOrderSummary(conversation);

                var responseMessage = $"✅ Đơn hàng đã được xác nhận thành công!\n\n" +
                                    $"📋 Mã đơn hàng: {orderCode}\n" +
                                    $"💰 Tổng tiền: {totalAmount:N0} VNĐ\n\n" +
                                    $"📦 Chi tiết đơn hàng:\n{orderSummary}\n\n" +
                                    $"📞 Chúng tôi sẽ liên hệ với số điện thoại {conversation.CustomerPhone} để xác nhận và giao hàng.\n" +
                                    $"🙏 Cảm ơn bạn đã tin tưởng chúng tôi!";

                // Delete the current conversation from database
                await _conversationStateService.DeleteConversationAsync(zaloUserId);
                
                return new MessageResponse
                {
                    Content = responseMessage,
                    MessageType = "text",
                    Intent = MessageIntents.CONFIRM_ORDER
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling confirm order intent for user: {UserId}", zaloUserId);
                
                return new MessageResponse
                {
                    Content = "Xin lỗi, có lỗi xảy ra khi xác nhận đơn hàng. Vui lòng thử lại sau hoặc liên hệ nhân viên hỗ trợ.",
                    MessageType = "text",
                    Intent = MessageIntents.CONFIRM_ORDER
                };
            }
        }


        private async Task<MessageResponse> HandlePlaceOrderIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            // Start the order process by asking for phone number
            await _conversationStateService.UpdateConversationStateAsync(zaloUserId, UserStates.WAITING_FOR_PHONE);

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

                    await _conversationStateService.UpdateConversationStateAsync(zaloUserId, UserStates.WAITING_FOR_PRODUCT_INFO);

                    return new MessageResponse
                    {
                        Content = string.Format(ZaloWebhookConstants.DefaultMessages.CUSTOMER_FOUND_ORDER_START, customer.CustomerName),
                        MessageType = "text",
                        
                    };
                }
                else
                {
                    // Customer doesn't exist - for now, we'll proceed with order but note that customer creation is for later
                    await _conversationStateService.UpdateConversationStateAsync(zaloUserId, UserStates.NEW);

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
                // if (conversation.OrderItems.Count == 0)
                // {
                //     await _conversationStateService.UpdateConversationStateAsync(zaloUserId, UserStates.NEW);
                //     return new MessageResponse
                //     {
                //         Content = ZaloWebhookConstants.DefaultMessages.NO_PRODUCTS_IN_ORDER,
                //         MessageType = "text",
                //     };
                // }
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
                var updatedConversation = await _conversationStateService.GetConversationAsync(zaloUserId);
                var orderSummary = await GenerateOrderSummary(updatedConversation);
                
                await _conversationStateService.UpdateConversationStateAsync(zaloUserId, UserStates.CONFIRMING);

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

        private async Task<MessageResponse> HandleCancelIntentAsync(string zaloUserId, string message, ConversationState conversation)
        {
            try
            {
                _logger.LogInformation("User {UserId} cancelled the conversation", zaloUserId);
                
                // Reset conversation state to NEW instead of deleting
                await _conversationStateService.UpdateConversationStateAsync(zaloUserId, UserStates.NEW);
                
                // Clear order items and customer data
                await _conversationStateService.UpdateConversationDataAsync(zaloUserId, conv =>
                {
                    conv.OrderItems.Clear();
                });
                
                return new MessageResponse
                {
                    Content = "✅ Đã hủy đơn hàng. Bạn có thể bắt đầu đặt hàng mới bằng cách gõ 'Đặt hàng'.",
                    MessageType = "text",
                    Intent = MessageIntents.CANCEL
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling cancel intent for user: {UserId}", zaloUserId);
                
                return new MessageResponse
                {
                    Content = "❌ Có lỗi xảy ra khi hủy đơn hàng. Vui lòng thử lại sau.",
                    MessageType = "text",
                    Intent = MessageIntents.CANCEL
                };
            }
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
                if (forwardResponse?.Items == null || !forwardResponse.Items.Any())
                {
                    _logger.LogWarning("No items found in forward response for user: {UserId}", zaloUserId);
                    return false;
                }

                // Convert RespondItem to OrderItem and add to conversation
                var orderItems = new List<OrderItem>();
                
                foreach (var item in forwardResponse.Items)
                {
                    // Calculate unit price for this item
                    var unitPrice = await _priceCalculationService.CalculateUnitPriceAsync(
                        item.ItemCode ?? string.Empty,
                        item.ItemType ?? string.Empty,
                        (float)item.Width,
                        (float)item.Height
                    );

                    var orderItem = new OrderItem
                    {
                        ProductCode = item.ItemCode ?? string.Empty,
                        ProductType = item.ItemType ?? string.Empty,
                        Height = (float)item.Height,
                        Width = (float)item.Width,
                        Thickness = (float)item.Thickness,
                        Quantity = item.Quantity,
                        UnitPrice = unitPrice,
                        TotalPrice = unitPrice * item.Quantity
                    };
                    
                    orderItems.Add(orderItem);
                }

                // Update conversation with new order items only
                var updateSuccess = await _conversationStateService.UpdateConversationDataAsync(zaloUserId, conv =>
                {
                    // Add new items to existing order items
                    conv.OrderItems.AddRange(orderItems);
                });

                if (!updateSuccess)
                {
                    _logger.LogError("Failed to update conversation with new order items for user: {UserId}", zaloUserId);
                    return false;
                }

                // Get updated conversation to verify the update
                var updatedConversation = await _conversationStateService.GetConversationAsync(zaloUserId);
                if (updatedConversation == null)
                {
                    _logger.LogError("Failed to retrieve updated conversation for user: {UserId}", zaloUserId);
                    return false;
                }

                _logger.LogInformation("Successfully added {ItemCount} items to conversation for user: {UserId}. Total items: {TotalItems}", 
                    orderItems.Count, zaloUserId, updatedConversation.OrderItems.Count);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order from response for user: {UserId}", zaloUserId);
                return false;
            }
        }

        private async Task<string> GenerateOrderSummary(ConversationState conversation)
        {
            var summary = "📋 CHI TIẾT ĐƠN HÀNG:\n\n";
            decimal totalOrderAmount = 0;
            
            foreach (var item in conversation.OrderItems)
            {
                summary += $"• {item.ProductCode} - {item.ProductType} - {item.Width}*{item.Height}*{item.Thickness} mm - SL: {item.Quantity}\n";
                summary += $"  💰 Đơn giá: {item.UnitPrice:N0} VNĐ - Thành tiền: {item.TotalPrice:N0} VNĐ\n\n";
                totalOrderAmount += item.TotalPrice;
            }

            summary += $"💰 TỔNG TIỀN: {totalOrderAmount:N0} VNĐ\n\n";
            summary += $"📞 Số điện thoại: {conversation.CustomerPhone}";
            
            if (conversation.CustomerId.HasValue)
            {
                var cus = await _customerService.GetCustomerByPhoneAsync(conversation.CustomerPhone);
                var cusName = cus?.CustomerName ?? "Chưa có thông tin";

                summary += $"\n👤 Khách hàng: {cusName}";
            }

            return summary;
        }
    }
}


