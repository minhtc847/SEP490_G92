using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.SalesOrder.ManageSalesOrder.Services;
using SEP490.Modules.Zalo.Constants;
using SEP490.Modules.Zalo.DTO;
using SEP490.Modules.Zalo.Services;
using System.Net.Http.Headers;
using System.Net.Http;
using System.Text.Json;

namespace SEP490.Modules.Zalo.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ZaloController : ControllerBase
    {
        private readonly IZaloAuthService zaloAuthService;

        public ZaloController(IZaloAuthService _zaloAuthService)
        {
            zaloAuthService = _zaloAuthService;
        }
        [HttpPost]
        public ActionResult<string> StoreDevelopedZaloToken([FromBody]DevTokenRequest devTokenRequest)
        {
             
            try
            {
                zaloAuthService.StoreDevAccessToken(devTokenRequest.AccessToken, devTokenRequest.RefreshToken);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error saving token:");
            }

            return Ok("Token stored successfully.");
        }
        [HttpGet("get-message")]
        public async Task<IActionResult> GetMessages(string userId)
        {
            var messages = await zaloAuthService.getListMessageFromUser(userId);
            return Ok(messages);
        }

    }
}
