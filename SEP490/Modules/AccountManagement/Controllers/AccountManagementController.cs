using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.AccountManagement.DTO;
using SEP490.Modules.AccountManagement.Services;

namespace SEP490.Modules.AccountManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountManagementController : ControllerBase
    {
        private readonly IAccountManagementService _accountService;

        public AccountManagementController(IAccountManagementService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetAccounts([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var result = await _accountService.GetAccountsAsync(page, pageSize);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAccountById(int id)
        {
            try
            {
                var result = await _accountService.GetAccountByIdAsync(id);
                if (result == null)
                {
                    return NotFound(new { message = "Tài khoản không tồn tại" });
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _accountService.CreateAccountAsync(request);
                if (!result.Success)
                {
                    return BadRequest(new { message = result.Message });
                }
                return Ok(new { message = result.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}/toggle-status")]
        public async Task<IActionResult> ToggleAccountStatus(int id)
        {
            try
            {
                var result = await _accountService.ToggleAccountStatusAsync(id);
                if (!result.Success)
                {
                    return BadRequest(new { message = result.Message });
                }
                return Ok(new { message = result.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAccount(int id)
        {
            try
            {
                var result = await _accountService.DeleteAccountAsync(id);
                if (!result.Success)
                {
                    return BadRequest(new { message = result.Message });
                }
                return Ok(new { message = result.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("employees-without-account")]
        public async Task<IActionResult> GetEmployeesWithoutAccount()
        {
            try
            {
                var result = await _accountService.GetEmployeesWithoutAccountAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            try
            {
                var result = await _accountService.GetRolesAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
