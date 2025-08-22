using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.AccountManagement.DTO;
using SEP490.Common.Services;
using System.Text;

namespace SEP490.Modules.AccountManagement.Services
{
    public interface IAccountManagementService
    {
        Task<AccountListResponse> GetAccountsAsync(int page, int pageSize);
        Task<AccountDetailResponse> GetAccountByIdAsync(int id);
        Task<ServiceResult> CreateAccountAsync(CreateAccountRequest request);
        Task<ServiceResult> ToggleAccountStatusAsync(int id);
        Task<ServiceResult> DeleteAccountAsync(int id);
        Task<List<EmployeeWithoutAccountResponse>> GetEmployeesWithoutAccountAsync();
        Task<List<RoleResponse>> GetRolesAsync();
        Task<bool> CheckUsernameExistsAsync(string username);
    }

    public class AccountManagementService : BaseScopedService, IAccountManagementService
    {
        private readonly SEP490DbContext _context;

        public AccountManagementService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<AccountListResponse> GetAccountsAsync(int page, int pageSize)
        {
            var query = _context.Accounts
                .Include(a => a.Employee)
                .Include(a => a.Role)
                .AsQueryable();

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            var accounts = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new AccountDetailResponse
                {
                    Id = a.Id,
                    Username = a.UserName,
                    EmployeeId = a.EmployeeId,
                    EmployeeName = a.Employee.FullName,
                    EmployeePhone = a.Employee.Phone,
                    EmployeeEmail = a.Employee.Email,
                    EmployeeAddress = a.Employee.Address,
                    RoleId = a.RoleId,
                    RoleName = a.Role.RoleName,
                    IsActive = a.IsActive
                })
                .ToListAsync();

            return new AccountListResponse
            {
                Accounts = accounts,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize,
                TotalPages = totalPages
            };
        }

        public async Task<AccountDetailResponse> GetAccountByIdAsync(int id)
        {
            var account = await _context.Accounts
                .Include(a => a.Employee)
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (account == null)
                return null;

            return new AccountDetailResponse
            {
                Id = account.Id,
                Username = account.UserName,
                EmployeeId = account.EmployeeId,
                EmployeeName = account.Employee.FullName,
                EmployeePhone = account.Employee.Phone,
                EmployeeEmail = account.Employee.Email,
                EmployeeAddress = account.Employee.Address,
                RoleId = account.RoleId,
                RoleName = account.Role.RoleName,
                IsActive = account.IsActive
            };
        }

        public async Task<ServiceResult> CreateAccountAsync(CreateAccountRequest request)
        {
            try
            {
                // Check if username already exists
                var existingAccount = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.UserName == request.Username);
                if (existingAccount != null)
                {
                    return new ServiceResult { Success = false, Message = "Tên đăng nhập đã tồn tại" };
                }

                // Check if employee already has an account
                var existingEmployeeAccount = await _context.Accounts
                    .FirstOrDefaultAsync(a => a.EmployeeId == request.EmployeeId);
                if (existingEmployeeAccount != null)
                {
                    return new ServiceResult { Success = false, Message = "Nhân viên này đã có tài khoản" };
                }

                // Check if employee exists
                var employee = await _context.Employees.FindAsync(request.EmployeeId);
                if (employee == null)
                {
                    return new ServiceResult { Success = false, Message = "Nhân viên không tồn tại" };
                }

                // Check if role exists
                var role = await _context.Roles.FindAsync(request.RoleId);
                if (role == null)
                {
                    return new ServiceResult { Success = false, Message = "Vai trò không tồn tại" };
                }

                var passwordHash = HashPassword(request.Password);
                var account = new Account
                {
                    UserName = request.Username,
                    PasswordHash = passwordHash,
                    EmployeeId = request.EmployeeId,
                    RoleId = request.RoleId,
                    IsActive = true
                };

                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();

                return new ServiceResult { Success = true, Message = "Tạo tài khoản thành công" };
            }
            catch (Exception ex)
            {
                return new ServiceResult { Success = false, Message = $"Lỗi: {ex.Message}" };
            }
        }

        public async Task<ServiceResult> ToggleAccountStatusAsync(int id)
        {
            try
            {
                var account = await _context.Accounts.FindAsync(id);
                if (account == null)
                {
                    return new ServiceResult { Success = false, Message = "Tài khoản không tồn tại" };
                }

                account.IsActive = !account.IsActive;
                await _context.SaveChangesAsync();

                var status = account.IsActive ? "mở khóa" : "khóa";
                return new ServiceResult { Success = true, Message = $"Đã {status} tài khoản thành công" };
            }
            catch (Exception ex)
            {
                return new ServiceResult { Success = false, Message = $"Lỗi: {ex.Message}" };
            }
        }

        public async Task<ServiceResult> DeleteAccountAsync(int id)
        {
            try
            {
                var account = await _context.Accounts.FindAsync(id);
                if (account == null)
                {
                    return new ServiceResult { Success = false, Message = "Tài khoản không tồn tại" };
                }

                _context.Accounts.Remove(account);
                await _context.SaveChangesAsync();

                return new ServiceResult { Success = true, Message = "Xóa tài khoản thành công" };
            }
            catch (Exception ex)
            {
                return new ServiceResult { Success = false, Message = $"Lỗi: {ex.Message}" };
            }
        }

        public async Task<List<EmployeeWithoutAccountResponse>> GetEmployeesWithoutAccountAsync()
        {
            var employeesWithAccounts = await _context.Accounts
                .Select(a => a.EmployeeId)
                .ToListAsync();

            var employeesWithoutAccounts = await _context.Employees
                .Where(e => !employeesWithAccounts.Contains(e.Id))
                .Select(e => new EmployeeWithoutAccountResponse
                {
                    Id = e.Id,
                    FullName = e.FullName,
                    Phone = e.Phone,
                    Email = e.Email,
                    Address = e.Address
                })
                .ToListAsync();

            return employeesWithoutAccounts;
        }

        public async Task<List<RoleResponse>> GetRolesAsync()
        {
            var roles = await _context.Roles
                .Select(r => new RoleResponse
                {
                    Id = r.Id,
                    RoleName = r.RoleName
                })
                .ToListAsync();

            return roles;
        }

        public async Task<bool> CheckUsernameExistsAsync(string username)
        {
            return await _context.Accounts.AnyAsync(a => a.UserName == username);
        }

        private string HashPassword(string password)
        {
            // Use Base64 encoding (same as AuthService) for consistency
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(password));
        }
    }
}
