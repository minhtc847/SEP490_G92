using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.Auth.DTO;
using SEP490.Modules.Auth.Services;

namespace SEP490.Modules.Auth.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.LoginAsync(request.Username, request.Password);
            
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new
            {
                message = result.Message,
                token = result.Token,
                user = result.User
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _authService.RegisterAsync(
                request.Username, 
                request.Password, 
                request.EmployeeId, 
                request.RoleId
            );

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateToken([FromBody] ValidateTokenRequest request)
        {
            var isValid = await _authService.ValidateTokenAsync(request.Token);
            
            if (!isValid)
            {
                return Unauthorized(new { message = "Token không hợp lệ" });
            }

            var user = await _authService.GetUserByTokenAsync(request.Token);
            return Ok(new { user });
        }

        [HttpPost("permission")]
        public async Task<IActionResult> CheckPermission([FromBody] CheckPermissionRequest request)
        {
            var hasPermission = await _authService.HasPermissionAsync(request.UserId, request.Permission);
            return Ok(new { hasPermission });
        }
    }
} 