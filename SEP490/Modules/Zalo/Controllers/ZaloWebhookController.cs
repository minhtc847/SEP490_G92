using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.SaleOrders.Services;
using SEP490.Modules.SaleOrders.DTO;
using SEP490.Modules.Zalo.Services;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace SEP490.Modules.Zalo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ZaloWebhookController : ControllerBase
    {
        private readonly IZaloOrderService _zaloOrderService;
        private readonly IZaloMessageService _zaloMessageService;
        private readonly ILogger<ZaloWebhookController> _logger;

        public ZaloWebhookController(
            IZaloOrderService zaloOrderService,
            IZaloMessageService zaloMessageService,
            ILogger<ZaloWebhookController> logger)
        {
            _zaloOrderService = zaloOrderService;
            _zaloMessageService = zaloMessageService;
            _logger = logger;
        }

        /// <summary>
        /// Webhook endpoint để nhận tin nhắn từ Zalo OA
        /// </summary>
        [HttpPost("message")]
        public async Task<IActionResult> ReceiveMessage([FromBody] ZaloWebhookRequest? request = null)
        {
            try
            {
                if (request == null)
                {
                    _logger.LogWarning("Received null webhook request");
                    return BadRequest("Invalid request body");
                }

                _logger.LogInformation("Received Zalo webhook: {Request}", JsonSerializer.Serialize(request));

                // Verify webhook (optional - tùy theo yêu cầu bảo mật)
                if (request.Event == "user_send_text" && !string.IsNullOrEmpty(request.Message?.Text))
                {
                    var userPhone = await GetUserPhoneNumber(request.Sender?.Id);
                    if (string.IsNullOrEmpty(userPhone))
                    {
                        // Check if user is trying to register
                        if (IsRegistrationMessage(request.Message.Text))
                        {
                            await HandleUserRegistration(request.Sender?.Id, request.Message.Text);
                            return Ok();
                        }
                        
                        await _zaloMessageService.SendTextMessageAsync(request.Sender?.Id, GetRegistrationInstructions());
                        return Ok();
                    }

                    // Parse message để extract order information
                    var orderData = ParseOrderMessage(request.Message.Text, userPhone);
                    
                    if (orderData != null)
                    {
                        // Gọi ZaloOrderService để tạo đơn hàng
                        var orderResult = await _zaloOrderService.CreateOrderFromZaloAsync(orderData);
                        
                        if (orderResult.Success && orderResult.OrderDetails != null)
                        {
                            // Gửi thông báo thành công
                            var successMessage = FormatOrderConfirmation(orderResult.OrderDetails);
                            await _zaloMessageService.SendTextMessageAsync(request.Sender?.Id, successMessage);
                        }
                        else
                        {
                            // Gửi thông báo lỗi
                            await _zaloMessageService.SendTextMessageAsync(request.Sender?.Id, $"❌ {orderResult.Message}");
                        }
                    }
                    else
                    {
                        // Gửi hướng dẫn sử dụng
                        await _zaloMessageService.SendTextMessageAsync(request.Sender?.Id, GetUsageInstructions());
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing Zalo webhook");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Parse tin nhắn từ user để extract thông tin đơn hàng
        /// </summary>
        private ZaloOrderRequestDto? ParseOrderMessage(string message, string userPhone)
        {
            try
            {
                // Mẫu format tin nhắn: "Đặt hàng: GL001 1000x800x6 x2" hoặc "Dat hang: GL001 1000x800x6 x2"
                var orderPattern = @"(đặt\s*hàng|dat\s*hang):?\s*(.+)";
                var orderMatch = Regex.Match(message.ToLower(), orderPattern, RegexOptions.IgnoreCase);
                
                if (!orderMatch.Success)
                    return null;

                var itemsText = orderMatch.Groups[2].Value;
                var items = new List<ZaloOrderItemDto>();

                // Pattern cho từng item: "GL001 1000x800x6 x2" hoặc "N-EI 15 1000x800x6 x2" (support space in product code)
                var itemPattern = @"([A-Z0-9\-\s]+?)\s+(\d+)x(\d+)x(\d+(?:\.\d+)?)\s+x(\d+)";
                var itemMatches = Regex.Matches(itemsText, itemPattern, RegexOptions.IgnoreCase);

                foreach (Match itemMatch in itemMatches)
                {
                    items.Add(new ZaloOrderItemDto
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
                    return new ZaloOrderRequestDto
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

        /// <summary>
        /// Lấy số điện thoại user từ Zalo API
        /// </summary>
        private async Task<string?> GetUserPhoneNumber(string? userId)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    return null;

                // Lấy thông tin user từ Zalo API
                var userInfoJson = await _zaloMessageService.GetUserInfoAsync(userId);
                
                _logger.LogInformation("Zalo API response for user {UserId}: {Response}", userId, userInfoJson ?? "NULL");
                
                if (string.IsNullOrEmpty(userInfoJson))
                {
                    _logger.LogWarning("Cannot get user info from Zalo API for user: {UserId}", userId);
                    
                    // Fallback: Map userId với phone number từ database
                    var mappedPhone = GetPhoneFromUserMapping(userId);
                    if (!string.IsNullOrEmpty(mappedPhone))
                    {
                        _logger.LogInformation("Using mapped phone {Phone} for user {UserId}", mappedPhone, userId);
                        return mappedPhone;
                    }
                    
                    _logger.LogWarning("No phone mapping found for user: {UserId}", userId);
                    return null;
                }

                // Parse JSON response để lấy phone number
                try
                {
                    var userInfo = JsonSerializer.Deserialize<ZaloUserInfo>(userInfoJson);
                    
                    // Lưu ý: Zalo API có thể không trả về phone trực tiếp
                    // Bạn cần kiểm tra API documentation để xem phone có trong response không
                    if (userInfo?.Data?.Phone != null)
                    {
                        return userInfo.Data.Phone;
                    }
                    
                    // Nếu không có phone trong response, log warning
                    _logger.LogWarning("Phone number not available in Zalo user info for user: {UserId}", userId);
                    
                    // Alternative: Có thể lấy phone từ shared_info nếu user đã share
                    if (userInfo?.Data?.SharedInfo?.Phone != null)
                    {
                        var phoneStr = userInfo.Data.SharedInfo.Phone.ToString();
                        if (!string.IsNullOrEmpty(phoneStr) && phoneStr != "0")
                        {
                            _logger.LogInformation("Found phone in shared_info for user {UserId}: {Phone}", userId, phoneStr);
                            return phoneStr;
                        }
                        else
                        {
                            _logger.LogInformation("Phone in shared_info is invalid (value: {Phone}) for user {UserId}", phoneStr, userId);
                        }
                    }
                    
                    // Fallback: Sử dụng mapping nếu Zalo API không có phone
                    _logger.LogWarning("Zalo API returned data but no phone for user {UserId}, trying mapping", userId);
                    var mappedPhone = GetPhoneFromUserMapping(userId);
                    if (!string.IsNullOrEmpty(mappedPhone))
                    {
                        _logger.LogInformation("Using mapped phone {Phone} for user {UserId} (from API fallback)", mappedPhone, userId);
                        return mappedPhone;
                    }
                    
                    return null;
                }
                catch (JsonException ex)
                {
                    _logger.LogError(ex, "Error parsing Zalo user info JSON for user: {UserId}", userId);
                    return null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user phone for userId: {UserId}", userId);
                return null;
            }
        }

        /// <summary>
        /// Map Zalo User ID với phone number từ database/configuration
        /// TODO: Thay bằng database lookup trong production
        /// </summary>
        private string? GetPhoneFromUserMapping(string userId)
        {
            // Mapping cho các user đã biết - thay bằng database lookup
            var userPhoneMapping = new Dictionary<string, string>
            {
                ["3621469840359096133"] = "0914913696", // User ID thật - UPDATE PHONE NUMBER NÀY
                // TODO: THÊM MAPPING CHO CUSTOMER CỦA BẠN TẠI ĐÂY:
                // ["USER_ID_CỦA_CUSTOMER"] = "SỐ_ĐIỆN_THOẠI_CUSTOMER",
                // Ví dụ: ["1234567890123456789"] = "0987654321",
            };

            return userPhoneMapping.TryGetValue(userId, out var phone) ? phone : null;
        }

        /// <summary>
        /// Format thông báo xác nhận đơn hàng
        /// </summary>
        private string FormatOrderConfirmation(ZaloOrderDetailsDto orderDetails)
        {
            var message = $"✅ **ĐƠN HÀNG ĐÃ TẠO THÀNH CÔNG**\n\n";
            message += $"📋 **Mã đơn hàng:** {orderDetails.OrderCode}\n";
            message += $"👤 **Khách hàng:** {orderDetails.CustomerName}\n";
            message += $"📍 **Địa chỉ:** {orderDetails.CustomerAddress}\n";
            message += $"📅 **Ngày đặt:** {orderDetails.OrderDate:dd/MM/yyyy HH:mm}\n\n";
            
            message += "**📦 SẢN PHẨM:**\n";
            foreach (var item in orderDetails.Items)
            {
                message += $"• {item.ProductName}\n";
                message += $"  📏 Kích thước: {item.Dimensions}\n";
                message += $"  📦 Số lượng: {item.Quantity}\n";
                message += $"  💰 Đơn giá: {item.UnitPrice:N0} VNĐ\n";
                message += $"  💵 Thành tiền: {item.TotalPrice:N0} VNĐ\n\n";
            }
            
            message += $"💰 **TỔNG TIỀN: {orderDetails.TotalAmount:N0} VNĐ**\n\n";
            message += "📞 Chúng tôi sẽ liên hệ với bạn sớm để xác nhận đơn hàng!";
            
            return message;
        }



        /// <summary>
        /// Hướng dẫn sử dụng cho user
        /// </summary>
        private string GetUsageInstructions()
        {
            return @"📝 **HƯỚNG DẪN ĐẶT HÀNG QUA ZALO**

🔤 **Format tin nhắn:**
Đặt hàng: [MÃ_SP] [CHIỀU_CAO]x[CHIỀU_RỘNG]x[ĐỘ_DÀY] x[SỐ_LƯỢNG]

📋 **Ví dụ:**
Đặt hàng: GL001 1000x800x6 x2, GL002 1200x900x8 x1

📏 **Giải thích:**
• GL001: Mã sản phẩm
• 1000x800x6: Kích thước (cao x rộng x dày)
• x2: Số lượng 2 tấm

✅ **Có thể đặt nhiều sản phẩm cùng lúc, cách nhau bằng dấu phẩy**

❓ **Cần hỗ trợ? Liên hệ: 0123456789**";
        }

        /// <summary>
        /// Kiểm tra xem tin nhắn có phải là đăng ký không
        /// </summary>
        private bool IsRegistrationMessage(string message)
        {
            if (string.IsNullOrEmpty(message))
                return false;

            // Check format: "Đăng ký: 0123456789" hoặc "Register: 0123456789"
            var registrationPattern = @"(đăng\s*ký|register):?\s*(\d{10,11})";
            return Regex.IsMatch(message.ToLower(), registrationPattern, RegexOptions.IgnoreCase);
        }

        /// <summary>
        /// Xử lý đăng ký user mới
        /// </summary>
        private async Task HandleUserRegistration(string? userId, string message)
        {
            try
            {
                if (string.IsNullOrEmpty(userId))
                    return;

                // Extract phone number từ message
                var registrationPattern = @"(đăng\s*ký|register):?\s*(\d{10,11})";
                var match = Regex.Match(message.ToLower(), registrationPattern, RegexOptions.IgnoreCase);

                if (match.Success)
                {
                    var phoneNumber = match.Groups[2].Value;
                    
                    // TODO: Save to database instead of temporary log
                    _logger.LogInformation("User registration request: UserId={UserId}, Phone={Phone}", userId, phoneNumber);
                    
                    // Send success message
                    var successMessage = $@"✅ **ĐĂNG KÝ THÀNH CÔNG!**

📞 **Số điện thoại:** {phoneNumber}
🆔 **User ID:** {userId}

🎉 **Bạn đã có thể đặt hàng qua Zalo!**

📝 **Để đặt hàng, gửi tin nhắn theo format:**
Đặt hàng: [MÃ_SP] [CAO]x[RỘNG]x[DÀY] x[SỐ_LƯỢNG]

📋 **Ví dụ:**
Đặt hàng: GL001 1000x800x6 x2

⚠️ **Lưu ý:** Admin cần thêm mapping này vào hệ thống:
[{userId}] = ""{phoneNumber}""";

                    await _zaloMessageService.SendTextMessageAsync(userId, successMessage);
                    
                    // Send notification to admin (optional)
                    _logger.LogWarning("NEW USER REGISTRATION: Add this mapping to code: [\"{UserId}\"] = \"{Phone}\"", userId, phoneNumber);
                }
                else
                {
                    await _zaloMessageService.SendTextMessageAsync(userId, "❌ Format đăng ký không đúng. Vui lòng thử lại!");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling user registration for {UserId}", userId);
            }
        }

        /// <summary>
        /// Hướng dẫn đăng ký cho user mới
        /// </summary>
        private string GetRegistrationInstructions()
        {
            return @"👋 **CHÀO MỪNG ĐÊN VỚI VNG GLASS!**

❌ **Chúng tôi chưa có thông tin của bạn trong hệ thống.**

📱 **ĐỂ BẮT ĐẦU ĐẶT HÀNG, VUI LÒNG ĐĂNG KÝ:**

🔤 **Format đăng ký:**
Đăng ký: [SỐ_ĐIỆN_THOẠI]

📋 **Ví dụ:**
Đăng ký: 0914913696

📞 **Lưu ý:**
• Sử dụng số điện thoại chính thức của bạn
• Số điện thoại gồm 10-11 chữ số
• Không có dấu cách hoặc ký tự đặc biệt

✅ **Sau khi đăng ký thành công, bạn có thể đặt hàng ngay!**

❓ **Cần hỗ trợ? Liên hệ: 0123456789**";
        }
    }

    /// <summary>
    /// Model cho webhook request từ Zalo
    /// </summary>
    public class ZaloWebhookRequest
    {
        public string? App_id { get; set; }
        public ZaloSender? Sender { get; set; }
        public ZaloRecipient? Recipient { get; set; }
        public string? Event { get; set; }
        public ZaloMessage? Message { get; set; }
        public long Timestamp { get; set; }
    }

    public class ZaloSender
    {
        public string? Id { get; set; }
    }

    public class ZaloRecipient
    {
        public string? Id { get; set; }
    }

    public class ZaloMessage
    {
        public string? Text { get; set; }
        public string? Msg_id { get; set; }
    }

    /// <summary>
    /// Model cho response từ Zalo GetProfile API
    /// </summary>
    public class ZaloUserInfo
    {
        public int Error { get; set; }
        public string? Message { get; set; }
        public ZaloUserData? Data { get; set; }
    }

    public class ZaloUserData
    {
        public string? User_id { get; set; }
        public string? Display_name { get; set; }
        public string? User_alias { get; set; }
        public bool? User_is_follower { get; set; }
        public string? Avatar { get; set; }
        public string? Phone { get; set; }
        public ZaloSharedInfo? SharedInfo { get; set; }
    }

    public class ZaloSharedInfo
    {
        public object? Phone { get; set; } // Có thể là string hoặc number từ Zalo API
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? District { get; set; }
        public string? User_dob { get; set; }
    }
} 