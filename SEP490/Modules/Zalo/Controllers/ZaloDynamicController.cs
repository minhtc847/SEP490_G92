using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.Zalo.Models;
using SEP490.Modules.Zalo.Services;
using SEP490.Modules.Zalo.DTO;
using SEP490.Modules.SaleOrders.Services;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace SEP490.Modules.Zalo.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ZaloDynamicController : ControllerBase
    {
        private readonly IZaloOrderService _orderService;
        private readonly IZaloMessageService _zaloMessageService;
        private readonly ILogger<ZaloDynamicController> _logger;

        public ZaloDynamicController(
            IZaloOrderService orderService,
            IZaloMessageService zaloMessageService,
            ILogger<ZaloDynamicController> logger)
        {
            _orderService = orderService;
            _zaloMessageService = zaloMessageService;
            _logger = logger;
        }

        /// <summary>
        /// Dynamic API endpoint cho Zalo Chatbot
        /// </summary>
        [HttpPost("chat")]
        public async Task<ActionResult<ZaloDynamicResponse>> HandleChatMessage([FromBody] ZaloDynamicChatRequest request)
        {
            try
            {
                _logger.LogInformation("Dynamic API called for user {UserId} with message: {Message}", 
                    request.UserId, request.Message);

                // Get conversation history and find current session
                var conversationSession = await GetCurrentConversationSession(request.UserId);
                
                // Update with current message info
                if (!string.IsNullOrEmpty(request.UserPhone))
                    conversationSession.UserPhone = request.UserPhone;

                // Route to appropriate handler based on message content and conversation state
                var response = await RouteConversationMessage(conversationSession, request.Message);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling dynamic API request for user {UserId}", request?.UserId);
                
                return Ok(ZaloDynamicResponseBuilder.CreateTextMessage(
                    "⚠️ Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút hoặc liên hệ hỗ trợ: 0123456789"));
            }
        }

        /// <summary>
        /// Lấy conversation history từ Zalo API và tìm session hiện tại
        /// </summary>
        private async Task<ConversationSession> GetCurrentConversationSession(string userId)
        {
            try
            {
                // TODO: Implement actual Zalo Conversation API call
                // For now, simulate conversation history
                var messages = await GetConversationHistory(userId);
                
                // Tìm session hiện tại (từ "Bắt đầu" gần nhất đến "Kết thúc" hoặc hiện tại)
                var currentSession = ParseCurrentSession(messages, userId);
                
                _logger.LogInformation("Found conversation session for user {UserId} with {MessageCount} messages, State: {State}", 
                    userId, currentSession.Messages.Count, currentSession.CurrentState);

                return currentSession;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting conversation session for user {UserId}", userId);
                
                // Return empty session if error
                return new ConversationSession 
                { 
                    UserId = userId,
                    CurrentState = OrderingState.Idle
                };
            }
        }

        /// <summary>
        /// Lấy conversation history từ Zalo API (simplified simulation)
        /// </summary>
        private async Task<List<ZaloConversationMessage>> GetConversationHistory(string userId)
        {
            // TODO: Call actual Zalo Conversation API
            // https://developers.zalo.me/docs/official-account/quan-ly-tin-nhan/lay-lich-su-tin-nhan-post-4445
            
            // For now, return empty list - will be populated in real implementation
            return new List<ZaloConversationMessage>();
        }

        /// <summary>
        /// Parse conversation history để tìm session hiện tại
        /// </summary>
        private ConversationSession ParseCurrentSession(List<ZaloConversationMessage> allMessages, string userId)
        {
            var session = new ConversationSession { UserId = userId };
            
            // Tìm "Bắt đầu" gần nhất
            var lastStartIndex = -1;
            var lastEndIndex = -1;
            
            for (int i = allMessages.Count - 1; i >= 0; i--)
            {
                var message = allMessages[i];
                var text = message.Text.ToLower().Trim();
                
                if (text.Contains("kết thúc") && lastEndIndex == -1)
                {
                    lastEndIndex = i;
                }
                else if (text.Contains("bắt đầu") && lastStartIndex == -1)
                {
                    lastStartIndex = i;
                    break; // Found start, stop searching
                }
            }
            
            // Nếu có "Bắt đầu" mà không có "Kết thúc" sau đó = session active
            if (lastStartIndex >= 0 && (lastEndIndex == -1 || lastEndIndex < lastStartIndex))
            {
                session.Messages = allMessages.Skip(lastStartIndex).ToList();
                session.SessionStart = allMessages[lastStartIndex].Timestamp;
                
                // Determine current state from messages
                session.CurrentState = DetermineOrderingState(session.Messages);
                session.PendingOrder = ExtractPendingOrder(session.Messages);
            }
            else
            {
                // No active session
                session.CurrentState = OrderingState.Idle;
            }
            
            return session;
        }

        /// <summary>
        /// Xác định state hiện tại từ conversation history
        /// </summary>
        private OrderingState DetermineOrderingState(List<ZaloConversationMessage> messages)
        {
            // Look at recent messages to determine state
            var recentUserMessages = messages
                .Where(m => m.IsFromUser)
                .TakeLast(5)
                .Select(m => m.Text.ToLower().Trim())
                .ToList();
            
            if (recentUserMessages.Any(m => m.Contains("đặt hàng") || m.Contains("bắt đầu")))
            {
                return OrderingState.WaitingForProductCode;
            }
            
            // TODO: Add more sophisticated state detection based on conversation flow
            return OrderingState.Idle;
        }

        /// <summary>
        /// Extract partial order từ conversation history
        /// </summary>
        private PartialOrder? ExtractPendingOrder(List<ZaloConversationMessage> messages)
        {
            // TODO: Implement extraction of partial order from conversation
            // Parse recent messages to rebuild current order state
            return null;
        }

        /// <summary>
        /// Route message dựa trên conversation state và support multi-step ordering
        /// </summary>
        private async Task<ZaloDynamicResponse> RouteConversationMessage(ConversationSession session, string message)
        {
            var messageLower = message.ToLower().Trim();

            // Handle session control commands
            if (messageLower.Contains("bắt đầu"))
            {
                return HandleSessionStart();
            }
            else if (messageLower.Contains("kết thúc"))
            {
                return HandleSessionEnd();
            }

            // Handle registration
            if (IsRegistrationMessage(message))
            {
                return await HandleRegistration(session, message);
            }

            // Check if user has phone
            if (string.IsNullOrEmpty(session.UserPhone))
            {
                return HandlePhoneRequired();
            }

            // Handle multi-step ordering based on current state
            switch (session.CurrentState)
            {
                case OrderingState.Idle:
                    return await HandleIdleState(session, message);

                case OrderingState.WaitingForProductCode:
                    return await HandleProductCodeInput(session, message);

                case OrderingState.WaitingForDimensions:
                    return await HandleDimensionsInput(session, message);

                case OrderingState.WaitingForQuantity:
                    return await HandleQuantityInput(session, message);

                case OrderingState.WaitingForConfirmation:
                    return await HandleConfirmationInput(session, message);

                case OrderingState.AddingMoreItems:
                    return await HandleAddMoreItemsInput(session, message);

                default:
                    return await HandleIdleState(session, message);
            }
        }

        #region Session Control

        private ZaloDynamicResponse HandleSessionStart()
        {
            var buttons = new List<ZaloDynamicButton>
            {
                ZaloDynamicResponseBuilder.CreateButton("🛒 Đặt hàng", "query", "đặt hàng"),
                ZaloDynamicResponseBuilder.CreateButton("📋 Hướng dẫn", "query", "hướng dẫn"),
                ZaloDynamicResponseBuilder.CreateButton("📞 Liên hệ", "phone", "0123456789")
            };

            return ZaloDynamicResponseBuilder.CreateTextMessage(@"🚀 **BẮT ĐẦU PHIÊN CHAT MỚI!**

👋 Chào mừng bạn đến với VNG Glass!

📋 **Bạn có thể:**
• Đặt hàng từng bước (mã SP → kích thước → số lượng)
• Đặt hàng nhanh (1 lần): ""Đặt hàng: N-EI 15 1000x800x6 x2""
• Tra cứu đơn hàng
• Nhận hỗ trợ

💡 **Để kết thúc phiên, gửi: ""Kết thúc""**", buttons);
        }

        private ZaloDynamicResponse HandleSessionEnd()
        {
            var buttons = new List<ZaloDynamicButton>
            {
                ZaloDynamicResponseBuilder.CreateButton("🔄 Bắt đầu lại", "query", "bắt đầu"),
                ZaloDynamicResponseBuilder.CreateButton("📞 Liên hệ", "phone", "0123456789")
            };

            return ZaloDynamicResponseBuilder.CreateTextMessage(@"👋 **KẾT THÚC PHIÊN CHAT!**

🙏 Cảm ơn bạn đã sử dụng dịch vụ VNG Glass!

📞 **Liên hệ hỗ trợ:** 0123456789
🌐 **Website:** vngglass.com

💡 **Để bắt đầu phiên mới, gửi: ""Bắt đầu""**", buttons);
        }

        #endregion

        #region Multi-Step Ordering

        private async Task<ZaloDynamicResponse> HandleIdleState(ConversationSession session, string message)
        {
            // Check for full order format (backward compatibility)
            if (IsFullOrderMessage(message))
            {
                return await HandleFullOrderCreation(session, message);
            }
            // Check for step-by-step order start
            else if (IsStepByStepOrderStart(message))
            {
                return StartStepByStepOrder(session);
            }
            // Handle other commands
            else if (IsOrderTrackingMessage(message))
            {
                return await HandleOrderTracking(session, message);
            }
            else if (IsOrderListMessage(message))
            {
                return await HandleOrderList(session);
            }
            else if (IsHelpMessage(message))
            {
                return HandleHelp();
            }
            else
            {
                return HandleUnknownCommand(session);
            }
        }

        private ZaloDynamicResponse StartStepByStepOrder(ConversationSession session)
        {
            session.CurrentState = OrderingState.WaitingForProductCode;
            session.PendingOrder = new PartialOrder 
            { 
                UserPhone = session.UserPhone ?? string.Empty,
                CurrentItem = new PartialOrderItem()
            };

            var buttons = new List<ZaloDynamicButton>
            {
                ZaloDynamicResponseBuilder.CreateButton("❌ Hủy", "query", "hủy đặt hàng"),
                ZaloDynamicResponseBuilder.CreateButton("❓ Hướng dẫn", "query", "hướng dẫn")
            };

            return ZaloDynamicResponseBuilder.CreateTextMessage(@"🛒 **BẮT ĐẦU ĐẶT HÀNG TỪNG BƯỚC**

📝 **Bước 1/4: Nhập mã sản phẩm**

💡 **Ví dụ:**
• N-EI 15 (kính chống cháy 15 phút)
• GL001 (kính cường lực)
• ABC-XYZ 30 (kính đặc biệt)

✍️ **Nhập mã sản phẩm của bạn:**", buttons);
        }

        private async Task<ZaloDynamicResponse> HandleProductCodeInput(ConversationSession session, string message)
        {
            if (message.ToLower().Contains("hủy"))
            {
                session.CurrentState = OrderingState.Idle;
                session.PendingOrder = null;
                return ZaloDynamicResponseBuilder.CreateTextMessage("❌ **ĐÃ HỦY ĐẶT HÀNG**\n\nBạn có thể bắt đầu lại bất cứ lúc nào!");
            }

            var productCode = ExtractProductCode(message);
            if (string.IsNullOrEmpty(productCode))
            {
                return ZaloDynamicResponseBuilder.CreateTextMessage(@"❌ **MÃ SẢN PHẨM KHÔNG HỢP LỆ**

📝 **Vui lòng nhập mã sản phẩm hợp lệ:**

💡 **Ví dụ đúng:**
• N-EI 15
• GL001  
• ABC-XYZ 30

✍️ **Thử lại:**");
            }

            // Save product code and move to next step
            session.PendingOrder!.CurrentItem!.ProductCode = productCode;
            session.CurrentState = OrderingState.WaitingForDimensions;

            var buttons = new List<ZaloDynamicButton>
            {
                ZaloDynamicResponseBuilder.CreateButton("❌ Hủy", "query", "hủy đặt hàng"),
                ZaloDynamicResponseBuilder.CreateButton("🔙 Quay lại", "query", "quay lại bước trước")
            };

            return ZaloDynamicResponseBuilder.CreateTextMessage($@"✅ **ĐÃ NHẬN MÃ SẢN PHẨM: {productCode}**

📝 **Bước 2/4: Nhập kích thước**

💡 **Format:** [CHIỀU_CAO]x[CHIỀU_RỘNG]x[ĐỘ_DÀY]

📏 **Ví dụ:**
• 1000x800x6
• 1200x900x8
• 800x600x4

✍️ **Nhập kích thước:**", buttons);
        }

        private async Task<ZaloDynamicResponse> HandleDimensionsInput(ConversationSession session, string message)
        {
            if (message.ToLower().Contains("hủy"))
            {
                session.CurrentState = OrderingState.Idle;
                session.PendingOrder = null;
                return ZaloDynamicResponseBuilder.CreateTextMessage("❌ **ĐÃ HỦY ĐẶT HÀNG**");
            }

            if (message.ToLower().Contains("quay lại"))
            {
                session.CurrentState = OrderingState.WaitingForProductCode;
                return ZaloDynamicResponseBuilder.CreateTextMessage(@"🔙 **QUAY LẠI BƯỚC 1**

📝 **Nhập mã sản phẩm:**");
            }

            var dimensions = ExtractDimensions(message);
            if (dimensions == null)
            {
                return ZaloDynamicResponseBuilder.CreateTextMessage(@"❌ **KÍCH THƯỚC KHÔNG HỢP LỆ**

📏 **Format đúng:** [CAO]x[RỘNG]x[DÀY]

💡 **Ví dụ:**
• 1000x800x6
• 1200x900x8

✍️ **Thử lại:**");
            }

            // Save dimensions and move to next step
            session.PendingOrder!.CurrentItem!.Height = dimensions.Value.Height;
            session.PendingOrder!.CurrentItem!.Width = dimensions.Value.Width;
            session.PendingOrder!.CurrentItem!.Thickness = dimensions.Value.Thickness;
            session.CurrentState = OrderingState.WaitingForQuantity;

            var buttons = new List<ZaloDynamicButton>
            {
                ZaloDynamicResponseBuilder.CreateButton("❌ Hủy", "query", "hủy đặt hàng"),
                ZaloDynamicResponseBuilder.CreateButton("🔙 Quay lại", "query", "quay lại bước trước")
            };

            return ZaloDynamicResponseBuilder.CreateTextMessage($@"✅ **ĐÃ NHẬN KÍCH THƯỚC: {dimensions.Value.Height}x{dimensions.Value.Width}x{dimensions.Value.Thickness}**

📝 **Bước 3/4: Nhập số lượng**

🔢 **Số lượng (tấm):**

💡 **Ví dụ:**
• 1
• 2  
• 5

✍️ **Nhập số lượng:**", buttons);
        }

        private async Task<ZaloDynamicResponse> HandleQuantityInput(ConversationSession session, string message)
        {
            if (message.ToLower().Contains("hủy"))
            {
                session.CurrentState = OrderingState.Idle;
                session.PendingOrder = null;
                return ZaloDynamicResponseBuilder.CreateTextMessage("❌ **ĐÃ HỦY ĐẶT HÀNG**");
            }

            if (message.ToLower().Contains("quay lại"))
            {
                session.CurrentState = OrderingState.WaitingForDimensions;
                return ZaloDynamicResponseBuilder.CreateTextMessage(@"🔙 **QUAY LẠI BƯỚC 2**

📏 **Nhập kích thước (CAOxRỘNGxDÀY):**");
            }

            var quantity = ExtractQuantity(message);
            if (quantity <= 0)
            {
                return ZaloDynamicResponseBuilder.CreateTextMessage(@"❌ **SỐ LƯỢNG KHÔNG HỢP LỆ**

🔢 **Vui lòng nhập số nguyên dương:**

💡 **Ví dụ:** 1, 2, 5, 10

✍️ **Thử lại:**");
            }

            // Save quantity and show confirmation
            session.PendingOrder!.CurrentItem!.Quantity = quantity;
            session.CurrentState = OrderingState.WaitingForConfirmation;

            var item = session.PendingOrder.CurrentItem;
            var buttons = new List<ZaloDynamicButton>
            {
                ZaloDynamicResponseBuilder.CreateButton("✅ Xác nhận", "query", "xác nhận đặt hàng"),
                ZaloDynamicResponseBuilder.CreateButton("➕ Thêm sản phẩm", "query", "thêm sản phẩm"),
                ZaloDynamicResponseBuilder.CreateButton("❌ Hủy", "query", "hủy đặt hàng")
            };

            return ZaloDynamicResponseBuilder.CreateTextMessage($@"📋 **XÁC NHẬN THÔNG TIN ĐẶT HÀNG**

🛒 **Sản phẩm:** {item.ProductCode}
📏 **Kích thước:** {item.Height}x{item.Width}x{item.Thickness}
🔢 **Số lượng:** {item.Quantity} tấm

💰 **Giá sẽ được báo sau khi xác nhận**

🤔 **Bạn muốn:**", buttons);
        }

        private async Task<ZaloDynamicResponse> HandleConfirmationInput(ConversationSession session, string message)
        {
            var messageLower = message.ToLower();

            if (messageLower.Contains("hủy"))
            {
                session.CurrentState = OrderingState.Idle;
                session.PendingOrder = null;
                return ZaloDynamicResponseBuilder.CreateTextMessage("❌ **ĐÃ HỦY ĐẶT HÀNG**");
            }
            else if (messageLower.Contains("thêm sản phẩm"))
            {
                // Add current item to list and start new item
                session.PendingOrder!.Items.Add(session.PendingOrder.CurrentItem!);
                session.PendingOrder.CurrentItem = new PartialOrderItem();
                session.CurrentState = OrderingState.WaitingForProductCode;

                return ZaloDynamicResponseBuilder.CreateTextMessage($@"➕ **THÊM SẢN PHẨM THỨ {session.PendingOrder.Items.Count + 1}**

📝 **Nhập mã sản phẩm tiếp theo:**");
            }
            else if (messageLower.Contains("xác nhận"))
            {
                // Add current item and create order
                session.PendingOrder!.Items.Add(session.PendingOrder.CurrentItem!);
                return await CreateOrderFromPartialOrder(session);
            }
            else
            {
                return ZaloDynamicResponseBuilder.CreateTextMessage(@"❓ **KHÔNG HIỂU LỰA CHỌN**

🤔 **Vui lòng chọn:**
• ""Xác nhận"" - Tạo đơn hàng
• ""Thêm sản phẩm"" - Thêm item khác
• ""Hủy"" - Hủy đặt hàng");
            }
        }

        private async Task<ZaloDynamicResponse> HandleAddMoreItemsInput(ConversationSession session, string message)
        {
            // Similar logic to confirmation, for future expansion
            return await HandleConfirmationInput(session, message);
        }

        #endregion

        #region Helper Methods

        private bool IsFullOrderMessage(string message)
        {
            // Check for full order format: "Đặt hàng: N-EI 15 1000x800x6 x2"
            var pattern = @"(đặt\s*hàng|dat\s*hang):?\s*([A-Z0-9\-\s]+?)\s+(\d+)x(\d+)x(\d+(?:\.\d+)?)\s+x(\d+)";
            return Regex.IsMatch(message.ToLower(), pattern, RegexOptions.IgnoreCase);
        }

        private bool IsStepByStepOrderStart(string message)
        {
            var patterns = new[]
            {
                @"đặt\s*hàng\s*$",
                @"order\s*$", 
                @"bắt\s*đầu\s*đặt\s*hàng",
                @"đặt\s*hàng\s*từng\s*bước"
            };
            
            return patterns.Any(pattern => 
                Regex.IsMatch(message.ToLower(), pattern, RegexOptions.IgnoreCase));
        }

        private string? ExtractProductCode(string message)
        {
            // Try to extract product code from message
            // Support various formats: "N-EI 15", "GL001", "ABC-XYZ 30"
            var patterns = new[]
            {
                @"^([A-Z0-9\-\s]+)$",  // Whole message is product code
                @"mã:?\s*([A-Z0-9\-\s]+)",  // "Mã: N-EI 15"
                @"sản\s*phẩm:?\s*([A-Z0-9\-\s]+)" // "Sản phẩm: GL001"
            };

            foreach (var pattern in patterns)
            {
                var match = Regex.Match(message.ToUpper(), pattern, RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    var code = match.Groups[1].Value.Trim();
                    if (!string.IsNullOrEmpty(code) && code.Length >= 2)
                    {
                        return code;
                    }
                }
            }

            return null;
        }

        private (string Height, string Width, decimal Thickness)? ExtractDimensions(string message)
        {
            // Extract dimensions: "1000x800x6" or "1000 x 800 x 6"
            var pattern = @"(\d+)\s*x\s*(\d+)\s*x\s*(\d+(?:\.\d+)?)";
            var match = Regex.Match(message, pattern, RegexOptions.IgnoreCase);

            if (match.Success)
            {
                return (
                    Height: match.Groups[1].Value,
                    Width: match.Groups[2].Value, 
                    Thickness: decimal.Parse(match.Groups[3].Value)
                );
            }

            return null;
        }

        private int ExtractQuantity(string message)
        {
            // Extract quantity from message
            var patterns = new[]
            {
                @"^(\d+)$",  // Whole message is number
                @"số\s*lượng:?\s*(\d+)",  // "Số lượng: 5"
                @"(\d+)\s*tấm",  // "5 tấm"
                @"x\s*(\d+)$"  // "x5" at end
            };

            foreach (var pattern in patterns)
            {
                var match = Regex.Match(message, pattern, RegexOptions.IgnoreCase);
                if (match.Success && int.TryParse(match.Groups[1].Value, out var quantity))
                {
                    return quantity;
                }
            }

            return 0;
        }

        private async Task<ZaloDynamicResponse> CreateOrderFromPartialOrder(ConversationSession session)
        {
            try
            {
                // Convert PartialOrder to ZaloOrderRequestDto
                var orderRequest = new Modules.SaleOrders.DTO.ZaloOrderRequestDto
                {
                    PhoneNumber = session.UserPhone ?? string.Empty,
                    Items = session.PendingOrder!.Items.Select(item => new Modules.SaleOrders.DTO.ZaloOrderItemDto
                    {
                        ProductCode = item.ProductCode ?? string.Empty,
                        Height = item.Height ?? string.Empty,
                        Width = item.Width ?? string.Empty,
                        Thickness = item.Thickness ?? 0,
                        Quantity = item.Quantity ?? 0
                    }).ToList()
                };

                // Create order
                var orderResponse = await _orderService.CreateOrderFromZaloAsync(orderRequest);

                // Reset session state
                session.CurrentState = OrderingState.Idle;
                session.PendingOrder = null;

                // Prepare response
                var itemsSummary = orderResponse.OrderDetails!.Items.Select(item => 
                    $"{item.ProductCode} ({item.Dimensions}) x{item.Quantity} = {item.TotalPrice:N0} VNĐ").ToList();

                var orderMessage = ZaloDynamicResponseBuilder.CreateOrderSummary(
                    orderResponse.OrderDetails.OrderCode, 
                    orderResponse.OrderDetails.TotalAmount, 
                    itemsSummary);

                return ZaloDynamicResponseBuilder.CreateMultipleMessages(new List<ZaloDynamicMessage> { orderMessage });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating order from partial order for user {UserId}", session.UserId);
                
                // Reset state on error
                session.CurrentState = OrderingState.Idle;
                session.PendingOrder = null;

                var buttons = new List<ZaloDynamicButton>
                {
                    ZaloDynamicResponseBuilder.CreateButton("🔄 Thử lại", "query", "đặt hàng"),
                    ZaloDynamicResponseBuilder.CreateButton("📞 Liên hệ hỗ trợ", "phone", "0123456789")
                };

                return ZaloDynamicResponseBuilder.CreateTextMessage(
                    $"❌ **LỖI TẠO ĐƠN HÀNG**\n\n{ex.Message}\n\nVui lòng thử lại hoặc liên hệ hỗ trợ.", buttons);
            }
        }

        private async Task<ZaloDynamicResponse> HandleFullOrderCreation(ConversationSession session, string message)
        {
            // Use existing ParseOrderMessage logic for backward compatibility
            var orderData = ParseOrderMessage(message, session.UserPhone ?? string.Empty);
            
            if (orderData == null || !orderData.Items.Any())
            {
                return ZaloDynamicResponseBuilder.CreateTextMessage(@"❌ **KHÔNG THỂ XỬ LÝ ĐƠN HÀNG**

🔤 **Format đúng:**
Đặt hàng: [MÃ_SP] [CAO]x[RỘNG]x[DÀY] x[SỐ_LƯỢNG]

📋 **Ví dụ:**
• Đặt hàng: N-EI 15 1000x800x6 x2
• Đặt hàng: GL001 1200x900x8 x1, N-EI 15 800x600x4 x3

💡 **Hoặc gửi ""Đặt hàng"" để đặt từng bước**");
            }

            return await CreateFullOrder(orderData);
        }

        private async Task<ZaloDynamicResponse> CreateFullOrder(Modules.SaleOrders.DTO.ZaloOrderRequestDto orderData)
        {
            try
            {
                var orderResponse = await _orderService.CreateOrderFromZaloAsync(orderData);

                var itemsSummary = orderResponse.OrderDetails!.Items.Select(item => 
                    $"{item.ProductCode} ({item.Dimensions}) x{item.Quantity} = {item.TotalPrice:N0} VNĐ").ToList();

                var orderMessage = ZaloDynamicResponseBuilder.CreateOrderSummary(
                    orderResponse.OrderDetails.OrderCode, 
                    orderResponse.OrderDetails.TotalAmount, 
                    itemsSummary);

                return ZaloDynamicResponseBuilder.CreateMultipleMessages(new List<ZaloDynamicMessage> { orderMessage });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating full order");
                
                var buttons = new List<ZaloDynamicButton>
                {
                    ZaloDynamicResponseBuilder.CreateButton("🔄 Thử lại", "query", "đặt hàng"),
                    ZaloDynamicResponseBuilder.CreateButton("📞 Liên hệ hỗ trợ", "phone", "0123456789")
                };

                return ZaloDynamicResponseBuilder.CreateTextMessage(
                    $"❌ **LỖI TẠO ĐƠN HÀNG**\n\n{ex.Message}\n\nVui lòng thử lại hoặc liên hệ hỗ trợ.", buttons);
            }
        }

        #endregion

        private bool IsRegistrationMessage(string message)
        {
            var pattern = @"(đăng\s*ký|register):?\s*(\d{10,11})";
            return Regex.IsMatch(message.ToLower(), pattern, RegexOptions.IgnoreCase);
        }

        private bool IsOrderMessage(string message)
        {
            var pattern = @"(đặt\s*hàng|dat\s*hang|order):?\s*(.+)";
            return Regex.IsMatch(message.ToLower(), pattern, RegexOptions.IgnoreCase);
        }

        private bool IsOrderTrackingMessage(string message)
        {
            var patterns = new[]
            {
                @"(theo\s*dõi|track|kiểm\s*tra)\s*(đơn\s*hàng|order)",
                @"(chi\s*tiết|detail)\s*(đơn\s*hàng|order)\s*([A-Z0-9]+)",
                @"(tình\s*trạng|status)\s*(đơn|order)"
            };

            return patterns.Any(pattern => 
                Regex.IsMatch(message.ToLower(), pattern, RegexOptions.IgnoreCase));
        }

        private bool IsOrderListMessage(string message)
        {
            var patterns = new[]
            {
                @"(danh\s*sách|list)\s*(đơn\s*hàng|order)",
                @"(lịch\s*sử|history)\s*(đặt\s*hàng|order)",
                @"(đơn\s*hàng|order)\s*(của\s*tôi|my)"
            };

            return patterns.Any(pattern => 
                Regex.IsMatch(message.ToLower(), pattern, RegexOptions.IgnoreCase));
        }

        private bool IsHelpMessage(string message)
        {
            var patterns = new[] { "help", "hướng dẫn", "hỗ trợ", "giúp đỡ", "?" };
            return patterns.Any(pattern => message.ToLower().Contains(pattern));
        }

        private async Task<ZaloDynamicResponse> HandleRegistration(ConversationSession session, string message)
        {
            var pattern = @"(đăng\s*ký|register):?\s*(\d{10,11})";
            var match = Regex.Match(message.ToLower(), pattern, RegexOptions.IgnoreCase);

            if (match.Success)
            {
                var phoneNumber = match.Groups[2].Value;
                session.UserPhone = phoneNumber;
                session.CurrentState = OrderingState.Idle;

                _logger.LogInformation("User {UserId} registered with phone {Phone}", 
                    session.UserId, phoneNumber);

                var buttons = new List<ZaloDynamicButton>
                {
                    ZaloDynamicResponseBuilder.CreateButton("🛒 Đặt hàng ngay", "query", "đặt hàng"),
                    ZaloDynamicResponseBuilder.CreateButton("📋 Hướng dẫn", "query", "hướng dẫn"),
                    ZaloDynamicResponseBuilder.CreateButton("📞 Liên hệ", "phone", "0123456789")
                };

                return ZaloDynamicResponseBuilder.CreateTextMessage($@"✅ **ĐĂNG KÝ THÀNH CÔNG!**

📞 **Số điện thoại:** {phoneNumber}
🎉 **Bạn đã có thể đặt hàng qua Zalo!**

🚀 **Sẵn sàng bắt đầu?**", buttons);
            }

            return ZaloDynamicResponseBuilder.CreateTextMessage(
                "❌ Format đăng ký không đúng. Vui lòng gửi: **Đăng ký: [SỐ_ĐIỆN_THOẠI]**\n\nVí dụ: Đăng ký: 0914913696");
        }

        private ZaloDynamicResponse HandlePhoneRequired()
        {
            var buttons = new List<ZaloDynamicButton>
            {
                ZaloDynamicResponseBuilder.CreateButton("📝 Đăng ký ngay", "query", "đăng ký: "),
                ZaloDynamicResponseBuilder.CreateButton("❓ Hướng dẫn", "query", "hướng dẫn đăng ký")
            };

            return ZaloDynamicResponseBuilder.CreateTextMessage(@"👋 **CHÀO MỪNG ĐÊN VỚI VNG GLASS!**

❌ **Chúng tôi chưa có thông tin của bạn trong hệ thống.**

📱 **ĐỂ BẮT ĐẦU ĐẶT HÀNG, VUI LÒNG ĐĂNG KÝ:**

🔤 **Format đăng ký:**
Đăng ký: [SỐ_ĐIỆN_THOẠI]

📋 **Ví dụ:**
Đăng ký: 0914913696", buttons);
        }



        private async Task<ZaloDynamicResponse> HandleOrderTracking(ConversationSession session, string message)
        {
            // Extract order code if provided
            var orderCodeMatch = Regex.Match(message, @"([A-Z0-9]{6,})", RegexOptions.IgnoreCase);
            
            if (orderCodeMatch.Success)
            {
                var orderCode = orderCodeMatch.Groups[1].Value.ToUpper();
                // TODO: Implement order tracking by code
                return ZaloDynamicResponseBuilder.CreateTextMessage(
                    $"🔍 **ĐANG TRA CỨU ĐƠN HÀNG: {orderCode}**\n\nTính năng này đang được phát triển...");
            }

            var buttons = new List<ZaloDynamicButton>
            {
                ZaloDynamicResponseBuilder.CreateButton("📋 Đơn hàng của tôi", "query", "danh sách đơn hàng"),
                ZaloDynamicResponseBuilder.CreateButton("📞 Gọi hỗ trợ", "phone", "0123456789")
            };

            return ZaloDynamicResponseBuilder.CreateTextMessage(
                "🔍 **TRA CỨU ĐƠN HÀNG**\n\nVui lòng cung cấp mã đơn hàng hoặc xem danh sách đơn hàng của bạn.", buttons);
        }

        private async Task<ZaloDynamicResponse> HandleOrderList(ConversationSession session)
        {
            var buttons = new List<ZaloDynamicButton>
            {
                ZaloDynamicResponseBuilder.CreateButton("🛒 Đặt hàng mới", "query", "đặt hàng"),
                ZaloDynamicResponseBuilder.CreateButton("📞 Liên hệ", "phone", "0123456789")
            };

            // TODO: Implement actual order history lookup from database by phone
            // For now, return placeholder message
            return ZaloDynamicResponseBuilder.CreateTextMessage(@"📋 **TRA CỨU ĐƠN HÀNG**

🔍 **Tính năng đang được phát triển...**

📞 **Để tra cứu đơn hàng, vui lòng liên hệ:** 0123456789

💡 **Hoặc bạn có thể đặt hàng mới ngay!**", buttons);
        }

        private ZaloDynamicResponse HandleHelp()
        {
            var buttons = new List<ZaloDynamicButton>
            {
                ZaloDynamicResponseBuilder.CreateButton("🛒 Đặt hàng", "query", "đặt hàng"),
                ZaloDynamicResponseBuilder.CreateButton("📋 Đơn hàng của tôi", "query", "danh sách đơn hàng"),
                ZaloDynamicResponseBuilder.CreateButton("📞 Liên hệ", "phone", "0123456789")
            };

            return ZaloDynamicResponseBuilder.CreateTextMessage(@"📝 **HƯỚNG DẪN SỬ DỤNG VNG GLASS CHATBOT**

🛒 **Đặt hàng:**
Đặt hàng: [MÃ_SP] [CAO]x[RỘNG]x[DÀY] x[SỐ_LƯỢNG]

📋 **Ví dụ:**
• Đặt hàng: N-EI 15 1000x800x6 x2
• Đặt hàng: GL001 1200x900x8 x1, ABC-XYZ 800x600x4 x3

🔍 **Tra cứu đơn hàng:**
• ""Danh sách đơn hàng""
• ""Chi tiết đơn hàng [MÃ_ĐƠN]""

📞 **Hỗ trợ:** 0123456789", buttons);
        }

        private ZaloDynamicResponse HandleUnknownCommand(ConversationSession session)
        {
            var buttons = new List<ZaloDynamicButton>
            {
                ZaloDynamicResponseBuilder.CreateButton("🛒 Đặt hàng", "query", "đặt hàng"),
                ZaloDynamicResponseBuilder.CreateButton("❓ Hướng dẫn", "query", "hướng dẫn"),
                ZaloDynamicResponseBuilder.CreateButton("📞 Liên hệ", "phone", "0123456789")
            };

            return ZaloDynamicResponseBuilder.CreateTextMessage(@"🤔 **KHÔNG HIỂU LỆNH CỦA BẠN**

✅ **Các lệnh có thể sử dụng:**
• Đặt hàng: [chi tiết sản phẩm]
• Danh sách đơn hàng
• Hướng dẫn
• Hỗ trợ

📞 **Cần trợ giúp? Gọi: 0123456789**", buttons);
        }

        // Copy ParseOrderMessage from ZaloWebhookController
        private Modules.SaleOrders.DTO.ZaloOrderRequestDto? ParseOrderMessage(string message, string userPhone)
        {
            try
            {
                var orderPattern = @"(đặt\s*hàng|dat\s*hang):?\s*(.+)";
                var orderMatch = Regex.Match(message.ToLower(), orderPattern, RegexOptions.IgnoreCase);
                
                if (!orderMatch.Success)
                    return null;

                var itemsText = orderMatch.Groups[2].Value;
                var items = new List<Modules.SaleOrders.DTO.ZaloOrderItemDto>();

                var itemPattern = @"([A-Z0-9\-\s]+?)\s+(\d+)x(\d+)x(\d+(?:\.\d+)?)\s+x(\d+)";
                var itemMatches = Regex.Matches(itemsText, itemPattern, RegexOptions.IgnoreCase);

                foreach (Match itemMatch in itemMatches)
                {
                    items.Add(new Modules.SaleOrders.DTO.ZaloOrderItemDto
                    {
                        ProductCode = itemMatch.Groups[1].Value.Trim().ToUpper(),
                        Height = itemMatch.Groups[2].Value,
                        Width = itemMatch.Groups[3].Value,
                        Thickness = decimal.Parse(itemMatch.Groups[4].Value),
                        Quantity = int.Parse(itemMatch.Groups[5].Value)
                    });
                }

                if (items.Any())
                {
                    return new Modules.SaleOrders.DTO.ZaloOrderRequestDto
                    {
                        PhoneNumber = userPhone,
                        Items = items
                    };
                }

                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error parsing order message: {Message}", message);
                return null;
            }
        }
    }
} 