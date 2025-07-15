using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Modules.ProductionOrders.Services;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CreateGelOrderController : ControllerBase
    {
        private readonly ICreateGelOrderService _createGelOrderService;

        public CreateGelOrderController(ICreateGelOrderService createGelOrderService)
        {
            _createGelOrderService = createGelOrderService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateGelOrder([FromBody] CreateGelOrderDto request)
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

                var result = await _createGelOrderService.CreateGelOrderAsync(request);

                if (result)
                {
                    return Ok(new { message = "Gel order created successfully" });
                }
                else
                {
                    return StatusCode(500, new { message = "Failed to create gel order" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating gel order", error = ex.Message });
            }
        }
    }
} 