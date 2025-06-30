using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using SEP490.Common.Services;

namespace SEP490.Modules.Auth.Services
{
    public interface IAuthService
    {
        Task<AuthResult> LoginAsync(string username, string password);
        Task<AuthResult> RegisterAsync(string username, string password, int employeeId, int roleId);
        Task<bool> ValidateTokenAsync(string token);
        Task<Account> GetUserByTokenAsync(string token);
        Task<bool> HasPermissionAsync(int userId, string permission);
    }

    public class AuthService : BaseService, IAuthService
    {
        private readonly SEP490DbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(SEP490DbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResult> LoginAsync(string username, string password)
        {
            try
            {
                var account = await _context.Accounts
                    .Include(a => a.Employee)
                    .Include(a => a.Role)
                    .FirstOrDefaultAsync(a => a.UserName == username);

                if (account == null)
                {
                    return new AuthResult { Success = false, Message = "Tài khoản không tồn tại" };
                }

                // Verify password (implement proper password hashing)
                if (!VerifyPassword(password, account.PasswordHash))
                {
                    return new AuthResult { Success = false, Message = "Mật khẩu không đúng" };
                }

                var token = GenerateJwtToken(account);
                var userInfo = new UserInfo
                {
                    Id = account.Id,
                    Username = account.UserName,
                    EmployeeId = account.EmployeeId,
                    EmployeeName = account.Employee?.FullName,
                    RoleId = account.RoleId,
                    RoleName = account.Role?.RoleName
                };

                return new AuthResult
                {
                    Success = true,
                    Token = token,
                    User = userInfo,
                    Message = "Đăng nhập thành công"
                };
            }
            catch (Exception ex)
            {
                return new AuthResult { Success = false, Message = $"Lỗi: {ex.Message}" };
            }
        }

        public async Task<AuthResult> RegisterAsync(string username, string password, int employeeId, int roleId)
        {
            try
            {
                var existingAccount = await _context.Accounts.FirstOrDefaultAsync(a => a.UserName == username);
                if (existingAccount != null)
                {
                    return new AuthResult { Success = false, Message = "Tài khoản đã tồn tại" };
                }

                var passwordHash = HashPassword(password);
                var account = new Account
                {
                    UserName = username,
                    PasswordHash = passwordHash,
                    EmployeeId = employeeId,
                    RoleId = roleId
                };

                _context.Accounts.Add(account);
                await _context.SaveChangesAsync();

                return new AuthResult { Success = true, Message = "Đăng ký thành công" };
            }
            catch (Exception ex)
            {
                return new AuthResult { Success = false, Message = $"Lỗi: {ex.Message}" };
            }
        }

        public async Task<bool> ValidateTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "your-secret-key-here");
                
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _configuration["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = _configuration["Jwt:Audience"],
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<Account> GetUserByTokenAsync(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                
                var userIdClaim = jwtToken.Claims.FirstOrDefault(x => x.Type == "userId");
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return null;
                }

                return await _context.Accounts
                    .Include(a => a.Employee)
                    .Include(a => a.Role)
                    .FirstOrDefaultAsync(a => a.Id == userId);
            }
            catch
            {
                return null;
            }
        }

        public async Task<bool> HasPermissionAsync(int userId, string permission)
        {
            try
            {
                var account = await _context.Accounts
                    .Include(a => a.Role)
                    .FirstOrDefaultAsync(a => a.Id == userId);

                if (account == null) return false;

                // Define permissions based on role
                var permissions = GetRolePermissions(account.RoleId);
                return permissions.Contains(permission);
            }
            catch
            {
                return false;
            }
        }

        private string GenerateJwtToken(Account account)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"] ?? "your-secret-key-here");
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim("userId", account.Id.ToString()),
                    new Claim("username", account.UserName),
                    new Claim("roleId", account.RoleId.ToString()),
                    new Claim("roleName", account.Role?.RoleName ?? ""),
                    new Claim("employeeId", account.EmployeeId.ToString())
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string HashPassword(string password)
        {
            // Implement proper password hashing (e.g., BCrypt)
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(password));
        }

        private bool VerifyPassword(string password, string hash)
        {
            // Implement proper password verification
            return HashPassword(password) == hash;
        }

        private List<string> GetRolePermissions(int roleId)
        {
            return roleId switch
            {
                1 => new List<string> { // Chủ xưởng
                    "dashboard.view", "dashboard.manage",
                    "orders.view", "orders.create", "orders.edit", "orders.delete",
                    "production.view", "production.create", "production.edit", "production.delete",
                    "customers.view", "customers.create", "customers.edit", "customers.delete",
                    "quotes.view", "quotes.create", "quotes.edit", "quotes.delete",
                    "glue.view", "glue.create", "glue.edit", "glue.delete",
                    "messages.view", "messages.manage",
                    "users.view", "users.create", "users.edit", "users.delete"
                },
                2 => new List<string> { // Kế toán
                    "dashboard.view",
                    "orders.view",
                    "production.view",
                    "customers.view",
                    "quotes.view", "quotes.create", "quotes.edit",
                    "reports.view", "reports.create"
                },
                3 => new List<string> { // Bộ phận sản xuất
                    "dashboard.view",
                    "orders.view",
                    "production.view", "production.edit",
                    "glue.view"
                },
                _ => new List<string>()
            };
        }
    }

    public class AuthResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string Token { get; set; }
        public UserInfo User { get; set; }
    }

    public class UserInfo
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public int RoleId { get; set; }
        public string RoleName { get; set; }
    }
} 