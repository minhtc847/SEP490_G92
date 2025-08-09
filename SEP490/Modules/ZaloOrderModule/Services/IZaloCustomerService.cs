using SEP490.DB.Models;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public interface IZaloCustomerService
    {
        Task<Customer?> GetCustomerByPhoneAsync(string phoneNumber);
        Task<bool> ValidatePhoneNumberAsync(string phoneNumber);
    }
}
