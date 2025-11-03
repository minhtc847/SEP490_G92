using SEP490.Modules.Zalo.DTO;
using ZaloMessageResponse = SEP490.Modules.Zalo.DTO.MessageResponse;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public interface IZaloMessageHistoryService
    {
        /// <summary>
        /// Retrieves messages from the conversation history between "Đặt hàng" and "Kết thúc" for a given customer
        /// </summary>
        /// <param name="zaloUserId">The Zalo user ID</param>
        /// <returns>List of messages from the order conversation</returns>
        Task<List<ZaloMessageResponse>> GetListMessageAsync(string zaloUserId);
    }
}
