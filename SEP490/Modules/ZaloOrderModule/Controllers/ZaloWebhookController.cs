using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SEP490.Modules.ZaloOrderModule.DTO;
using SEP490.Modules.ZaloOrderModule.Services;

namespace SEP490.Modules.ZaloOrderModule.Controllers
{
    [Route("api/zalo-order")]
    [ApiController]
    public class ZaloWebhookController : ControllerBase
    {
        private readonly ILogger<ZaloWebhookController> _logger;
        private readonly IZaloWebhookService _webhookService;

        public ZaloWebhookController(
            ILogger<ZaloWebhookController> logger,
            IZaloWebhookService webhookService)
        {
            _logger = logger;
            _webhookService = webhookService;
        }

        /// <summary>
        /// Webhook endpoint để nhận sự kiện tin nhắn từ Zalo
        /// </summary>
        /// <param name="request">Dữ liệu webhook từ Zalo</param>
        /// <returns>Kết quả xử lý webhook</returns>
        [HttpPost("webhook")]
        public async Task<IActionResult> HandleWebhook([FromBody] ZaloWebhookRequest request)
        {
            try
            {
                _logger.LogInformation("Received webhook from Zalo: {EventName} from user {UserId}", 
                    request.EventName, request.Sender.Id);

                // Validate request
                if (request == null || string.IsNullOrEmpty(request.EventName))
                {
                    _logger.LogWarning("Invalid webhook request received");
                    return BadRequest(new ZaloWebhookResponse 
                    { 
                        Status = "error", 
                        Message = "Invalid request data" 
                    });
                }

                // Process the webhook
                var response = await _webhookService.ProcessWebhookAsync(request);

                _logger.LogInformation("Webhook processed successfully: {EventName} for user {UserId}", 
                    request.EventName, request.Sender.Id);

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing webhook from Zalo");
                
                return StatusCode(500, new ZaloWebhookResponse 
                { 
                    Status = "error", 
                    Message = "Internal server error" 
                });
            }
        }

        /// <summary>
        /// Endpoint để test webhook (chỉ dùng trong development)
        /// </summary>
        /// <param name="testRequest">Dữ liệu test</param>
        /// <returns>Kết quả test</returns>
        [HttpPost("test-webhook")]
        public async Task<IActionResult> TestWebhook([FromBody] ZaloWebhookRequest testRequest)
        {
            try
            {
                _logger.LogInformation("Testing webhook with event: {EventName}", testRequest.EventName);

                var response = await _webhookService.ProcessWebhookAsync(testRequest);

                return Ok(new
                {
                    success = true,
                    message = "Test webhook processed successfully",
                    data = response
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in test webhook");
                
                return StatusCode(500, new
                {
                    success = false,
                    message = "Test webhook failed",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Endpoint để gửi tin nhắn thủ công (chỉ dùng trong development)
        /// </summary>
        /// <param name="request">Thông tin tin nhắn</param>
        /// <returns>Kết quả gửi tin nhắn</returns>
        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.RecipientId) || string.IsNullOrEmpty(request.Message))
                {
                    return BadRequest(new { success = false, message = "RecipientId and Message are required" });
                }

                var success = await _webhookService.SendMessageToZaloAsync(request.RecipientId, request.Message);

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
                _logger.LogError(ex, "Error sending message");
                
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error sending message",
                    error = ex.Message
                });
            }
        }


        /// <summary>
        /// Endpoint để kiểm tra trạng thái webhook
        /// </summary>
        /// <returns>Trạng thái webhook</returns>
        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "ZaloOrderWebhook",
                version = "1.0.0"
            });
        }
    }

    // DTO cho test endpoints
    public class SendMessageRequest
    {
        public string RecipientId { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    public class SendImageRequest
    {
        public string RecipientId { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
    }
}


