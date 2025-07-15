using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ProductionOrders.Services;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using Microsoft.AspNetCore.SignalR;
using SEP490.Modules.LLMChat.Services;
using SEP490.Hubs;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductionOrdersController : ControllerBase
    {
        private readonly IProductionOrdersService _productionOrdersService;
        private readonly IHubContext<OrderHub> _hubContext;
        public ProductionOrdersController(IProductionOrdersService productionOrdersService, IHubContext<OrderHub> hubContext)
        {
            _productionOrdersService = productionOrdersService;
            _hubContext = hubContext;
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

        /// <summary>
        /// Lấy thông tin ProductionOrder theo Id.
        /// </summary>
        [HttpGet("{productionOrderId:int}")]
        public async Task<IActionResult> GetProductionOrderById(int productionOrderId)
        {
            var order = await _productionOrdersService.GetProductionOrderByIdAsync(productionOrderId);
            if (order == null)
                return NotFound($"Không tìm thấy ProductionOrder với Id {productionOrderId}");

            return Ok(order);
        }

        [HttpPost("create/{planId}")]
        public async Task<IActionResult> CreateProductionOrderForPlan(int planId)
        {
            var order = await _productionOrdersService.CreateProductionOrderAsync(planId);
            if (order == null)
                return NotFound($"Không tìm thấy kế hoạch sản xuất với Id {planId}");
            await _hubContext.Clients.All.SendAsync("OrderCreated", new
            {
                message = "Đơn hàng mới đã được tạo",
                ordercode = order.ProductionOrderCode,
                createAt = DateTime.Now.ToString("dd/MM/yyyy HH:mm")
            });

            return Ok(order);
        }

        [HttpPost("{productionOrderId}/create-outputs")]
        public async Task<IActionResult> CreateProductionOutputs(int productionOrderId)
        {
            var outputs = await _productionOrdersService.CreateProductionOutputsFromOrderAsync(productionOrderId);
            if (outputs == null || !outputs.Any())
                return NotFound("No products found to create outputs.");
            return Ok(outputs);
        }

        /// <summary>
        /// Lấy danh sách ProductionOutput của một ProductionOrder
        /// </summary>
        [HttpGet("{productionOrderId}/production-outputs")]
        public async Task<IActionResult> GetProductionOutputs(int productionOrderId)
        {
            var outputs = await _productionOrdersService.GetProductionOutputsAsync(productionOrderId);
            if (outputs == null || !outputs.Any())
                return NotFound($"Không tìm thấy ProductionOutputs cho ProductionOrder {productionOrderId}");

            return Ok(outputs);
        }

        [HttpGet]
        public ActionResult<List<ProductionOrderListDto>> GetAll()
        {
            var result = _productionOrdersService.GetAll();
            return Ok(result);
        }

        [HttpGet("by-code/{productionOrderId}")]
        public ActionResult<List<ProductionOrderDetailDto>> GetDetails(int productionOrderId)
        {
            var result = _productionOrdersService.GetDetailsByProductionOrderId(productionOrderId);
            return Ok(result);
        }

        [HttpGet("{productionOrderId:int}/calculate/{productId}")]
        public ActionResult<ProductCalculationDto> CalculateProduct(int productionOrderId, int productId)
        {
            var result = _productionOrdersService.CalculateProduct(productionOrderId, productId);
            return Ok(result);
        }
    }
}
