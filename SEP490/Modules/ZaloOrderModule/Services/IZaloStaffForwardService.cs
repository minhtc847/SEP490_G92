using SEP490.Modules.ZaloOrderModule.DTO;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public interface IZaloStaffForwardService
    {
        /// <summary>
        /// Forward message to staff for handling
        /// </summary>
        /// <param name="zaloUserId">Zalo user ID</param>
        /// <param name="message">User message</param>
        /// <param name="userInfo">User information</param>
        /// <returns>True if forwarded successfully</returns>
        Task<bool> ForwardToStaffAsync(string zaloUserId, string message, object? userInfo = null);
        
        /// <summary>
        /// Check if staff is available
        /// </summary>
        /// <returns>True if staff is available</returns>
        Task<bool> IsStaffAvailableAsync();
    }
}
