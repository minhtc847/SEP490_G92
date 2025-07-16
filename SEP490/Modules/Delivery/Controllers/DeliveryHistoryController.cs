using Microsoft.AspNetCore.Mvc;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Delivery.DTO;
using SEP490.Modules.Delivery.Services;

namespace SEP490.Modules.Delivery.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeliveryHistoryController : ControllerBase
    {
        private readonly IDeliveryHistoryService _service;
        public DeliveryHistoryController(IDeliveryHistoryService service)
        {
            _service = service;
        }

        // GET: api/Delivery/by-production-plan/{productionPlanId}
        [HttpGet("by-production-plan/{productionPlanId}")]
        public async Task<IActionResult> GetDeliveryOrdersByProductionPlanId(int productionPlanId)
        {
            var result = await _service.GetDeliveryOrdersByProductionPlanIdAsync(productionPlanId);
            return Ok(result);
        }

        // GET: api/Delivery/history/{productionPlanDetailId}
        [HttpGet("history/{productionPlanDetailId}")]
        public async Task<IActionResult> GetDeliveryHistoryByProduct(int productionPlanDetailId)
        {
            var result = await _service.GetDeliveryHistoryByProductAsync(productionPlanDetailId);
            return Ok(result);
        }

        // POST: api/Delivery/history/{productionPlanDetailId}
        [HttpPost("history/{productionPlanDetailId}")]
        public async Task<IActionResult> CreateDeliveryHistory(int productionPlanDetailId, [FromBody] CreateDeliveryHistoryDto dto)
        {
            var result = await _service.CreateDeliveryHistoryAsync(productionPlanDetailId, dto);
            return Ok(result);
        }
    }
} 