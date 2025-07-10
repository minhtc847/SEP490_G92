using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ProductionOrders.Services;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductionOrdersController : ControllerBase
    {
        private readonly IProductionOrdersService _productionOrdersService;
        public ProductionOrdersController(IProductionOrdersService productionOrdersService)
        {
            _productionOrdersService = productionOrdersService;
        }

        [HttpGet("by-plan/{productionPlanId}")]
        public async Task<ActionResult<List<ProductionOrdersByPlanDto>>> GetByPlanId(int productionPlanId)
        {
            var orders = await _productionOrdersService.GetProductionOrdersByPlanIdAsync(productionPlanId);
            if (orders == null || !orders.Any())
            {
                return NotFound($"No production orders found for plan ID {productionPlanId}");
            }
            return Ok(orders);
        }

    }
}
