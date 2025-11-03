using SEP490.Modules.Zalo.DTO;

namespace SEP490.Modules.Zalo.Services
{
    public interface IZaloAuthService
    {
        public void StoreDevAccessToken(string accessToken, string refreshToken);
        public Task<List<MessageResponse>> getListMessageFromUser(string userId);
    }
}
