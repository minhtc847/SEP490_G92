using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Modules.ProductionOrders.Services;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExportInvoiceController : ControllerBase
    {
        private readonly IExportInvoiceService _exportInvoiceService;

        public ExportInvoiceController(IExportInvoiceService exportInvoiceService)
        {
            _exportInvoiceService = exportInvoiceService;
        }

        [HttpGet("by-production-plan/{productionPlanId}")]
        public async Task<ActionResult<List<ExportInvoiceDto>>> GetByProductionPlanId(int productionPlanId)
        {
            try
            {
                var exportInvoices = await _exportInvoiceService.GetExportInvoicesByProductionPlanIdAsync(productionPlanId);
                return Ok(exportInvoices);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
} 