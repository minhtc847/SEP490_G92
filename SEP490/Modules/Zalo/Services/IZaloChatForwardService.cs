using SEP490.Modules.Zalo.DTO;

namespace SEP490.Modules.Zalo.Services
{
    public interface IZaloChatForwardService
    {

        Task<LLMResponse> ForwardMessagesAsync(List<MessageResponse> messages);
    }
}
