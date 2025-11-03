using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Common.Attributes;
using SEP490.Common.Constants;
using SEP490.Modules.ProductionOrders.Services;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Yêu cầu authentication
    public class ProductionOrdersController : ControllerBase
    {
        private readonly IProductionOrdersService _productionOrdersService;
        public ProductionOrdersController(IProductionOrdersService productionOrdersService)
        {
            _productionOrdersService = productionOrdersService;
        }

        [HttpGet("by-plan/{productionPlanId}")]
        [AuthorizeRoles( Roles.MANAGER, Roles.PRODUCTION, Roles.ACCOUNTANT)]
        public async Task<ActionResult<List<ProductionOrdersByPlanDto>>> GetByPlanId(int productionPlanId)
        {
            var orders = await _productionOrdersService.GetProductionOrdersByPlanIdAsync(productionPlanId);
            if (orders == null || !orders.Any())
            {
                return NotFound($"No production orders found for plan ID {productionPlanId}");
            }
            return Ok(orders);
        }

        [HttpGet("all")]
        [AuthorizeRoles( Roles.MANAGER, Roles.PRODUCTION, Roles.ACCOUNTANT)]
        public async Task<ActionResult<List<ProductionOrdersByPlanDto>>> GetAll()
        {
            var orders = await _productionOrdersService.GetAllProductionOrdersAsync();
            if (orders == null || !orders.Any())
            {
                return NotFound("No production orders found");
            }
            return Ok(orders);
        }

        [HttpGet("{productionOrderId}/outputs")]
        public async Task<ActionResult<List<ProductionOutputDto>>> GetOutputsByOrderId(int productionOrderId)
        {
            var outputs = await _productionOrdersService.GetProductionOutputsByOrderIdAsync(productionOrderId);
            if (outputs == null || !outputs.Any())
            {
                return NotFound("No production outputs found for this production order");
            }
            return Ok(outputs);
        }

        [HttpGet("{productionOrderId}/defects")]
        public async Task<ActionResult<List<ProductionDefectDto>>> GetDefectsByOrderId(int productionOrderId)
        {
            var defects = await _productionOrdersService.GetProductionDefectsByOrderIdAsync(productionOrderId);
            return Ok(defects);
        }

        [HttpPost("defects")]
        [AuthorizeRoles( Roles.MANAGER, Roles.PRODUCTION)]
        public async Task<IActionResult> CreateDefectReport([FromBody] CreateDefectReportDto dto)
        {
            var result = await _productionOrdersService.CreateDefectReportAsync(dto);
            if (!result)
                return BadRequest("Không thể tạo báo cáo lỗi. Vui lòng kiểm tra lại thông tin.");
            return Ok(new { message = "Tạo báo cáo lỗi thành công." });
        }

        [HttpPut("defects/{defectId}")]
        [AuthorizeRoles( Roles.MANAGER, Roles.PRODUCTION)]
        public async Task<IActionResult> UpdateDefectReport(int defectId, [FromBody] UpdateDefectReportDto dto)
        {
            var result = await _productionOrdersService.UpdateDefectReportAsync(defectId, dto);
            if (!result)
                return BadRequest("Không thể cập nhật báo cáo lỗi. Vui lòng kiểm tra lại thông tin.");
            return Ok(new { message = "Cập nhật báo cáo lỗi thành công." });
        }

        [HttpPut("outputs/{outputId}/report-broken")]
        public async Task<IActionResult> ReportBrokenOutput(int outputId, [FromBody] ReportBrokenOutputDto dto)
        {
            var result = await _productionOrdersService.ReportBrokenOutputAsync(outputId, dto);
            if (!result)
                return NotFound("Không tìm thấy thành phẩm hoặc số lượng không hợp lệ.");
            return Ok(new { message = "Báo hỏng thành công." });
        }

        [HttpGet("{productionOrderId}/production-plan-status")]
        [AuthorizeRoles(Roles.MANAGER, Roles.PRODUCTION, Roles.ACCOUNTANT)]
        public async Task<ActionResult<object>> GetProductionPlanStatus(int productionOrderId)
        {
            var status = await _productionOrdersService.GetProductionPlanStatusAsync(productionOrderId);
            if (status == null)
                return NotFound($"Không tìm thấy production plan cho production order ID {productionOrderId}");
            return Ok(new { status = status });
        }

    }
}
