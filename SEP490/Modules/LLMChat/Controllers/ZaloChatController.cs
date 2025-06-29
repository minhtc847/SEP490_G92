using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.LLMChat.Services;

namespace SEP490.Modules.LLMChat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ZaloChatController : ControllerBase
    {
        private readonly ZaloChatService _zaloChatService;

        public ZaloChatController(ZaloChatService zaloChatService)
        {
            _zaloChatService = zaloChatService;
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessZaloChat([FromBody] ZaloChatRequest request)
        {
            var response = await _zaloChatService.SendZaloChatAsync(request);
            var responseBody = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, responseBody);
        }
    }
}
