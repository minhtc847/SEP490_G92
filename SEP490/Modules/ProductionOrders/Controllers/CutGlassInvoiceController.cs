using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Modules.ProductionOrders.Services;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CutGlassInvoiceController : ControllerBase
    {
        private readonly ICutGlassInvoiceService _service;
        public CutGlassInvoiceController(ICutGlassInvoiceService service)
        {
            _service = service;
        }

        [HttpGet("by-production-order/{productionOrderId}")]
        public ActionResult<CutGlassInvoiceDetailDto> GetByProductionOrderId(int productionOrderId)
        {
            var result = _service.GetByProductionOrderId(productionOrderId);
            return Ok(result);
        }

        [HttpPost]
        public IActionResult SaveCutGlassInvoice([FromBody] SaveCutGlassInvoiceRequestDto request)
        {
            try
            {
                _service.SaveCutGlassInvoice(request);
                return Ok(new { success = true, message = "Lưu phiếu cắt kính thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
} 