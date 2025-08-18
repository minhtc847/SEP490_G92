using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ZaloOrderModule.DTO;
using SEP490.Modules.ZaloOrderModule.Services;

namespace SEP490.Modules.ZaloOrderModule.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ZaloOrderController : ControllerBase
    {
        private readonly IZaloOrderService _zaloOrderService;

        public ZaloOrderController(IZaloOrderService zaloOrderService)
        {
            _zaloOrderService = zaloOrderService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ZaloOrderDTO>>> GetAllZaloOrders()
        {
            try
            {
                var zaloOrders = await _zaloOrderService.GetAllZaloOrdersAsync();
                return Ok(zaloOrders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ZaloOrderDTO>> GetZaloOrderById(int id)
        {
            try
            {
                var zaloOrder = await _zaloOrderService.GetZaloOrderByIdAsync(id);
                if (zaloOrder == null)
                {
                    return NotFound(new { message = "Zalo order not found" });
                }

                return Ok(zaloOrder);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ZaloOrderDTO>> CreateZaloOrder([FromBody] CreateZaloOrderDTO createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var zaloOrder = await _zaloOrderService.CreateZaloOrderAsync(createDto);
                return CreatedAtAction(nameof(GetZaloOrderById), new { id = zaloOrder.Id }, zaloOrder);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ZaloOrderDTO>> UpdateZaloOrder(int id, [FromBody] UpdateZaloOrderDTO updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var zaloOrder = await _zaloOrderService.UpdateZaloOrderAsync(id, updateDto);
                if (zaloOrder == null)
                {
                    return NotFound(new { message = "Zalo order not found" });
                }

                return Ok(zaloOrder);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteZaloOrder(int id)
        {
            try
            {
                var result = await _zaloOrderService.DeleteZaloOrderAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Zalo order not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("{id}/convert-to-order")]
        public async Task<ActionResult> ConvertToOrder(int id)
        {
            try
            {
                var orderCode = await _zaloOrderService.ConvertToOrderAsync(id);
                return Ok(new { 
                    message = "Zalo order converted to sale order successfully",
                    orderCode = orderCode
                });
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}
