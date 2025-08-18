using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.InventorySlipModule.Services;
using SEP490.Modules.InventorySlipModule.DTOs;

namespace SEP490.Modules.InventorySlipModule.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductionOutputController : ControllerBase
    {
        private readonly IInventoryProductionOutputService _productionOutputService;

        public ProductionOutputController(IInventoryProductionOutputService productionOutputService)
        {
            _productionOutputService = productionOutputService;
        }

        [HttpPut("{id}/finished")]
        public async Task<IActionResult> UpdateFinishedQuantity(int id, [FromBody] UpdateFinishedQuantityDto dto)
        {
            try
            {
                var result = await _productionOutputService.UpdateFinishedQuantityAsync(id, dto.FinishedQuantity);
                if (result)
                {
                    return Ok(new { message = "Cập nhật số lượng hoàn thành thành công" });
                }
                return BadRequest(new { message = "Không thể cập nhật số lượng hoàn thành" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }

        [HttpGet("production-order/{productionOrderId}")]
        public async Task<IActionResult> GetByProductionOrderId(int productionOrderId)
        {
            try
            {
                var outputs = await _productionOutputService.GetByProductionOrderIdAsync(productionOrderId);
                return Ok(outputs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi server: {ex.Message}" });
            }
        }
    }
}
