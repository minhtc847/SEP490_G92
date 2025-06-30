using System.ComponentModel.DataAnnotations;

namespace SEP490.Modules.Auth.DTO
{
    public class LoginRequest
    {
        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
        public string Username { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string Password { get; set; }

        [Required(ErrorMessage = "ID nhân viên là bắt buộc")]
        public int EmployeeId { get; set; }

        [Required(ErrorMessage = "ID vai trò là bắt buộc")]
        public int RoleId { get; set; }
    }

    public class ValidateTokenRequest
    {
        [Required(ErrorMessage = "Token là bắt buộc")]
        public string Token { get; set; }
    }

    public class CheckPermissionRequest
    {
        [Required(ErrorMessage = "ID người dùng là bắt buộc")]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Quyền là bắt buộc")]
        public string Permission { get; set; }
    }
} 