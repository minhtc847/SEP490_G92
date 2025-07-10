using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Modules.ProductionOrders.Services;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GlueGlassOrderController : ControllerBase
    {
        private readonly IGlueGlassOrderService _glueGlassOrderService;

        public GlueGlassOrderController(IGlueGlassOrderService glueGlassOrderService)
        {
            _glueGlassOrderService = glueGlassOrderService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateGlueGlassOrder([FromBody] GlueGlassOrderDto request)
        {
            try
            {
                var result = await _glueGlassOrderService.CreateGlueGlassOrderAsync(request);
                if (result)
                {
                    return Ok(new { success = true, message = "Lệnh ghép kính đã được tạo thành công" });
                }
                else
                {
                    return BadRequest(new { success = false, message = "Có lỗi xảy ra khi tạo lệnh ghép kính" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Lỗi server: " + ex.Message });
            }
        }
    }
} 