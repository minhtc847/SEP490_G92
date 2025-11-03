using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Modules.ProductionOrders.Services;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PourGlueOrderController : ControllerBase
    {
        private readonly IPourGlueOrderService _pourGlueOrderService;

        public PourGlueOrderController(IPourGlueOrderService pourGlueOrderService)
        {
            _pourGlueOrderService = pourGlueOrderService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePourGlueOrder([FromBody] PourGlueOrderDto request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest("Request data is required");
                }

                if (request.ProductionPlanId <= 0)
                {
                    return BadRequest("ProductionPlanId is required");
                }

                if (request.ProductQuantities == null || !request.ProductQuantities.Any())
                {
                    return BadRequest("Product quantities are required");
                }

                var result = await _pourGlueOrderService.CreatePourGlueOrderAsync(request);

                if (result)
                {
                    return Ok(new { message = "Pour glue order created successfully" });
                }
                else
                {
                    return StatusCode(500, new { message = "Failed to create pour glue order" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating pour glue order", error = ex.Message });
            }
        }
    }
} 