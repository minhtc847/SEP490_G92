using System.ComponentModel.DataAnnotations;

namespace SEP490.Modules.AccountManagement.DTO
{
    public class CreateAccountRequest
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

    public class AccountDetailResponse
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public string EmployeePhone { get; set; }
        public string EmployeeEmail { get; set; }
        public string EmployeeAddress { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; }
        public bool IsActive { get; set; }
    }

    public class AccountListResponse
    {
        public List<AccountDetailResponse> Accounts { get; set; }
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class EmployeeWithoutAccountResponse
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Phone { get; set; }
        public string Email { get; set; }
        public string Address { get; set; }
    }

    public class RoleResponse
    {
        public int Id { get; set; }
        public string RoleName { get; set; }
    }

    public class ServiceResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}
