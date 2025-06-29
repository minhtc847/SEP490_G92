using SEP490.Modules.Users.DTO;

namespace SEP490.Modules.Users.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDTO> LoginAsync(LoginRequestDTO dto);
    }
}
