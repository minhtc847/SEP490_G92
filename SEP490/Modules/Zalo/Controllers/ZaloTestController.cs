using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.Zalo.Services;

namespace SEP490.Modules.Zalo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ZaloTestController : ControllerBase
    {
        private readonly IZaloMessageService _zaloMessageService;
        private readonly ILogger<ZaloTestController> _logger;

        public ZaloTestController(IZaloMessageService zaloMessageService, ILogger<ZaloTestController> logger)
        {
            _zaloMessageService = zaloMessageService;
            _logger = logger;
        }

        /// <summary>
        /// Test gửi tin nhắn Zalo (sẽ tự động refresh token nếu cần)
        /// </summary>
        [HttpPost("send-message")]
        public async Task<IActionResult> TestSendMessage([FromBody] TestMessageRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.UserId) || string.IsNullOrEmpty(request.Message))
                {
                    return BadRequest("UserId and Message are required");
                }

                var success = await _zaloMessageService.SendTextMessageAsync(request.UserId, request.Message);

                if (success)
                {
                    return Ok(new { success = true, message = "Message sent successfully" });
                }
                else
                {
                    return StatusCode(500, new { success = false, message = "Failed to send message" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing Zalo message");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Test với user ID thật để debug (3621469840359096133)
        /// </summary>
        [HttpPost("test-debug")]
        public async Task<IActionResult> TestDebugMessage()
        {
            try
            {
                var testMessage = "🧪 Test message from Zalo API v3\n\nTime: " + DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss");
                var success = await _zaloMessageService.SendTextMessageAsync("3621469840359096133", testMessage);

                return Ok(new 
                { 
                    success = success, 
                    message = success ? "Debug message sent successfully" : "Failed to send debug message",
                    timestamp = DateTime.Now
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in debug test");
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get user info từ Zalo API
        /// </summary>
        [HttpGet("user-info/{userId}")]
        public async Task<IActionResult> GetUserInfo(string userId)
        {
            try
            {
                var userInfo = await _zaloMessageService.GetUserInfoAsync(userId);
                
                if (!string.IsNullOrEmpty(userInfo))
                {
                    return Ok(new { success = true, data = userInfo });
                }
                else
                {
                    return NotFound(new { success = false, message = "User info not found" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting user info for {UserId}", userId);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Check status của Zalo integration
        /// </summary>
        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            try
            {
                // Test với user không tồn tại để check token
                var userInfo = await _zaloMessageService.GetUserInfoAsync("test_status_check");
                
                return Ok(new 
                { 
                    status = "running",
                    timestamp = DateTime.Now,
                    message = "Zalo integration is active",
                    note = "Token will auto-refresh if expired"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking Zalo status");
                return Ok(new 
                { 
                    status = "error",
                    timestamp = DateTime.Now,
                    message = ex.Message,
                    note = "Check Zalo configuration in appsettings.json"
                });
            }
        }

        /// <summary>
        /// Debug: Lấy thông tin user từ Zalo API
        /// </summary>
        [HttpGet("user-debug/{userId}")]
        public async Task<IActionResult> DebugUserInfo(string userId)
        {
            try
            {
                var userInfo = await _zaloMessageService.GetUserInfoAsync(userId);
                
                return Ok(new 
                { 
                    userId = userId,
                    rawResponse = userInfo,
                    timestamp = DateTime.Now,
                    note = "Raw response from Zalo API"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting debug user info for {UserId}", userId);
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    public class TestMessageRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }
} 