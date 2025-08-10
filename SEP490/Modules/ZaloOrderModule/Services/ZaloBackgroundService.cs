using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SEP490.Modules.ZaloOrderModule.DTO;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    /// <summary>
    /// Service for handling background Zalo webhook processing
    /// </summary>
    public interface IZaloBackgroundService
    {
        Task ProcessWebhookInBackgroundAsync(ZaloWebhookRequest request);
    }

    public class ZaloBackgroundService : IZaloBackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<ZaloBackgroundService> _logger;

        public ZaloBackgroundService(IServiceProvider serviceProvider, ILogger<ZaloBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        public async Task ProcessWebhookInBackgroundAsync(ZaloWebhookRequest request)
        {
            try
            {
                _logger.LogInformation("Starting background webhook processing for event: {EventName}, user: {UserId}", 
                    request.EventName, request.Sender?.Id);

                // Tạo scope mới cho background task
                using var scope = _serviceProvider.CreateScope();
                var webhookService = scope.ServiceProvider.GetRequiredService<IZaloWebhookService>();
                
                await webhookService.ProcessWebhookAsync(request);
                
                _logger.LogInformation("Background webhook processing completed for event: {EventName}, user: {UserId}", 
                    request.EventName, request.Sender?.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in background webhook processing for event: {EventName}, user: {UserId}", 
                    request.EventName, request.Sender?.Id);
            }
        }
    }
}
