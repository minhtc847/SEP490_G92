using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ProductionOrders.Services;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using Microsoft.EntityFrameworkCore;
using SEP490.DB;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductionOrdersController : ControllerBase
    {
        private readonly IProductionOrdersService _productionOrdersService;
        private readonly IProductionOutputService _productionOutputService;
        private readonly SEP490DbContext _context;
        public ProductionOrdersController(IProductionOrdersService productionOrdersService, IProductionOutputService productionOutputService, SEP490DbContext context)
        {
            _productionOrdersService = productionOrdersService;
            _productionOutputService = productionOutputService;
            _context = context;
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

        [HttpGet("outputs/{productionOrderId}")]
        public async Task<ActionResult<List<ProductionOutputDto>>> GetOutputsByProductionOrderId(int productionOrderId)
        {
            var outputs = await _productionOutputService.GetByProductionOrderIdAsync(productionOrderId);
            if (outputs == null || !outputs.Any())
            {
                return NotFound($"No production outputs found for production order ID {productionOrderId}");
            }
            return Ok(outputs);
        }
    }
}
