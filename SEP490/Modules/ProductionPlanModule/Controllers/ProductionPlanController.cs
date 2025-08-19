using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.DB.Models;
using SEP490.Modules.Production_plans.DTO;
using SEP490.Modules.Production_plans.Services;
using SEP490.Modules.ProductionOrders.Services;

namespace SEP490.Modules.Production_plans.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductionPlanController : ControllerBase
    {

        private readonly IProductionPlanService _productionPlanService;
        private readonly IProductionOrdersService _productionOrdersService;
        public ProductionPlanController(IProductionPlanService productionPlanService, IProductionOrdersService productionOrdersService)
        {
            _productionPlanService = productionPlanService;
            _productionOrdersService = productionOrdersService;
        }

        [HttpGet("list")]
        public async Task<IActionResult> GetProductionPlanList()
        {
            var plans = await _productionPlanService.GetProductionPlanListAsync();
            return Ok(plans);
        }

        [HttpGet("detail/{id}")]
        public async Task<IActionResult> GetProductionPlanDetail(int id)
        {
            var detail = await _productionPlanService.GetProductionPlanDetailAsync(id);
            if (detail == null) return NotFound();
            return Ok(detail);
        }

        [HttpGet("detail/{id}/products")]
        public async Task<IActionResult> GetProductionPlanProductDetails(int id)
        {
            var productDetails = await _productionPlanService.GetProductionPlanProductDetailsAsync(id);
            return Ok(productDetails);
        }

        [HttpGet("detail/{id}/production-orders")]
        public async Task<IActionResult> GetProductionOrdersByPlanId(int id)
        {
            var orders = await _productionOrdersService.GetProductionOrdersByPlanIdAsync(id);
            return Ok(orders);
        }

        [HttpGet("detail/{id}/materials")]
        public async Task<IActionResult> GetProductionPlanMaterialDetail(int id)
        {
            var detail = await _productionPlanService.GetProductionPlanMaterialDetailAsync(id);
            return Ok(detail);
        }

        [HttpGet("detail/{id}/outputs")]
        public async Task<IActionResult> GetProductionPlanOutputs(int id)
        {
            var outputs = await _productionPlanService.GetProductionPlanOutputsAsync(id);
            return Ok(outputs);
        }

        [HttpPost("create-from-sale-order")]
        public async Task<IActionResult> CreateFromSaleOrder([FromBody] CreateProductionPlanFromSaleOrderDTO dto)
        {
            var result = await _productionPlanService.CreateProductionPlanFromSaleOrderAsync(dto);
            
            return Ok(result);
        }

        [HttpGet("has-production-plan/{saleOrderId}")]
        public async Task<IActionResult> HasProductionPlan(int saleOrderId)
        {
            var hasPlan = await _productionPlanService.HasProductionPlanAsync(saleOrderId);
            return Ok(new { hasProductionPlan = hasPlan });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProductionPlan(int id)
        {
            var result = await _productionPlanService.DeleteProductionPlanAsync(id);
            if (!result)
                return StatusCode(500, new { message = "Xoá kế hoạch sản xuất thất bại!" });
            return Ok(new { message = "Xoá kế hoạch sản xuất thành công!" });
        }
    }
}
