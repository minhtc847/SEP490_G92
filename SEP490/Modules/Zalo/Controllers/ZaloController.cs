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
        private readonly IZaloChatForwardService zaloChatForwardService;

        public ZaloController(IZaloAuthService _zaloAuthService, IZaloChatForwardService _zaloChatForwardService)
        {
            zaloAuthService = _zaloAuthService;
            zaloChatForwardService = _zaloChatForwardService;
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
            var forwarded = await zaloChatForwardService.ForwardMessagesAsync(messages);
            if (!forwarded)
                return StatusCode(500, "Failed to forward messages.");
            return Ok(messages);
        }
    }
}
