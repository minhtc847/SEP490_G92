using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SEP490.Modules.ZaloOrderModule.DTO;
using SEP490.Modules.ZaloOrderModule.Services;
using System.Text.Json;

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
        /// <param name="payload">Raw JSON payload từ Zalo</param>
        /// <returns>Kết quả xử lý webhook</returns>
        [HttpPost("webhook")]
        public async Task<IActionResult> HandleWebhook([FromBody] JsonElement payload)
        {
            try
            {
                // Đọc event_name từ payload
                var eventName = payload.GetProperty("event_name").GetString();
                _logger.LogInformation("Received webhook event: {EventName}", eventName);

                if (string.IsNullOrEmpty(eventName))
                {
                    _logger.LogWarning("Invalid webhook request - missing event_name");
                    return BadRequest(new ZaloWebhookResponse 
                    { 
                        Status = "error", 
                        Message = "Invalid request data" 
                    });
                }

                // Trả về 200 OK ngay lập tức cho tất cả sự kiện
                var response = new ZaloWebhookResponse 
                { 
                    Status = "ok", 
                    Message = "Webhook received" 
                };

                // Nếu không phải user_send_text thì chỉ log và trả về
                if (!eventName.Equals("user_send_text", StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogInformation("Event {EventName} ignored - returning 200 OK", eventName);
                    return Ok(response);
                }

                // Xử lý user_send_text trong background (fire-and-forget)
                _ = Task.Run(async () =>
                {
                    try
                    {
                        var request = JsonSerializer.Deserialize<ZaloWebhookRequest>(payload.ToString());
                        await _webhookService.ProcessWebhookAsync(request);
                        _logger.LogInformation("Background webhook processed: {EventName} for user {UserId}", 
                            eventName, request?.Sender?.Id);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error in background webhook processing: {EventName}", eventName);
                    }
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing webhook from Zalo");
                
                // Vẫn trả về 200 OK để Zalo không retry
                return Ok(new ZaloWebhookResponse 
                { 
                    Status = "ok", 
                    Message = "Webhook received (with errors)" 
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
}


