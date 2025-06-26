using SEP490.Modules.Zalo.DTO;

namespace SEP490.Modules.Zalo.Services
{
    public interface IZaloChatForwardService
    {
        Task<bool> ForwardMessagesAsync(List<MessageResponse> messages);
    }
}
