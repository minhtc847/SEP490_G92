using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SEP490.DB;
using SEP490.Modules.Users.DTO;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SEP490.Modules.Users.Services
{
    public class AuthService : IAuthService
    {
        private readonly SEP490DbContext _context;
        private readonly IConfiguration _config;

        public AuthService(SEP490DbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<LoginResponseDTO> LoginAsync(LoginRequestDTO dto)
        {
            var account = await _context.Accounts
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.UserName == dto.UserName && a.PasswordHash == dto.Password); // Có thể dùng băm

            if (account == null)
                throw new Exception("Sai thông tin đăng nhập");

            var claims = new[]
            {
            new Claim(ClaimTypes.Name, account.UserName),
            new Claim(ClaimTypes.Role, account.Role.RoleName)
        };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(3),
                signingCredentials: creds
            );

            return new LoginResponseDTO
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                UserName = account.UserName,
                Role = account.Role.RoleName
            };
        }
    }

}
