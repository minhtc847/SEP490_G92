using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SEP490.Modules.ZaloOrderModule.DTO;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    /// <summary>
    /// Factory for creating Zalo webhook services in background tasks
    /// </summary>
    public interface IZaloWebhookServiceFactory
    {
        Task ProcessWebhookAsync(ZaloWebhookRequest request);
    }

    public class ZaloWebhookServiceFactory : IZaloWebhookServiceFactory
    {
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly ILogger<ZaloWebhookServiceFactory> _logger;

        public ZaloWebhookServiceFactory(IServiceScopeFactory serviceScopeFactory, ILogger<ZaloWebhookServiceFactory> logger)
        {
            _serviceScopeFactory = serviceScopeFactory;
            _logger = logger;
        }

        public async Task ProcessWebhookAsync(ZaloWebhookRequest request)
        {
            try
            {
                _logger.LogInformation("Starting webhook processing for event: {EventName}, user: {UserId}", 
                    request.EventName, request.Sender?.Id);

                // Tạo scope mới cho background task
                using var scope = _serviceScopeFactory.CreateScope();
                var webhookService = scope.ServiceProvider.GetRequiredService<IZaloWebhookService>();
                
                await webhookService.ProcessWebhookAsync(request);
                
                _logger.LogInformation("Webhook processing completed for event: {EventName}, user: {UserId}", 
                    request.EventName, request.Sender?.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in webhook processing for event: {EventName}, user: {UserId}", 
                    request.EventName, request.Sender?.Id);
            }
        }
    }
}
