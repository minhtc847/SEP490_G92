using SEP490.Modules.ZaloOrderModule.DTO;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public interface IZaloWebhookService
    {
        Task<ZaloWebhookResponse> ProcessWebhookAsync(ZaloWebhookRequest request);
        Task<bool> SendMessageToZaloAsync(string recipientId, string message);
        Task<bool> SendImageToZaloAsync(string recipientId, string imageUrl, string? thumbnailUrl = null);
  }
}

