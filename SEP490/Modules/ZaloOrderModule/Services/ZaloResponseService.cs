using Microsoft.Extensions.Logging;
using SEP490.Common.Services;
using SEP490.Modules.ZaloOrderModule.Constants;
using SEP490.Modules.ZaloOrderModule.DTO;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public interface IZaloResponseService
    {
        Task<MessageResponse> GetUnsupportedEventResponseAsync();
    }

    public class ZaloResponseService: BaseTransientService, IZaloResponseService
    {
        private readonly ILogger<ZaloResponseService> _logger;

        public ZaloResponseService(ILogger<ZaloResponseService> logger)
        {
            _logger = logger;
        }

        public async Task<MessageResponse> GetUnsupportedEventResponseAsync()
        {
            return new MessageResponse
            {
                Content = $"{ZaloWebhookConstants.DefaultMessages.UNSUPPORTED_EVENT}\n\n{ZaloWebhookConstants.DefaultMessages.CONTACT_SUPPORT}",
                MessageType = "text",
                Intent = MessageIntents.UNKNOWN,
            };
        }
    }
}


