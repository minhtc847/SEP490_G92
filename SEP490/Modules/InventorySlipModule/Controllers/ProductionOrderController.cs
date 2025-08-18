using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.InventorySlipModule.Services;

namespace SEP490.Modules.InventorySlipModule.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductionOrderController : ControllerBase
    {
        private readonly IProductionOrderService _productionOrderService;

        public ProductionOrderController(IProductionOrderService productionOrderService)
        {
            _productionOrderService = productionOrderService;
        }

        [HttpPut("{id}/check-completion")]
        public async Task<IActionResult> CheckAndUpdateCompletion(int id)
        {
            try
            {
                var result = await _productionOrderService.CheckAndUpdateCompletionAsync(id);
                if (result)
                {
                    return Ok(new { message = "Kiểm tra và cập nhật trạng thái thành công" });
                }
                return BadRequest(new { message = "Không thể cập nhật trạng thái lệnh sản xuất" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("{id}/info")]
        public async Task<IActionResult> GetInfo(int id)
        {
            try
            {
                var info = await _productionOrderService.GetProductionOrderInfoAsync(id);
                if (info != null)
                {
                    return Ok(info);
                }
                return NotFound(new { message = "Không tìm thấy lệnh sản xuất" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}
