using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.Modules.PurchaseOrderModule.DTO;
using SEP490.Modules.PurchaseOrderModule.Service;

namespace SEP490.Modules.PurchaseOrderModule.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly IPurchaseOrderService _purchaseOrderService;

        public PurchaseOrderController(IPurchaseOrderService purchaseOrderService)
        {
            _purchaseOrderService = purchaseOrderService;
        }

        [HttpGet]
        public async Task<ActionResult<List<PurchaseOrderDto>>> GetAll()
        {
            var result = await _purchaseOrderService.GetAllPurchaseOrdersAsync();
            return Ok(result);
        }

        [HttpGet("next-code")]
        public IActionResult GetNextCode()
        {
            var code = _purchaseOrderService.GetNextPurchaseOrderCode(); 
            return Ok(code);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrderWithDetailsDto>> GetById(int id)
        {
            var order = await _purchaseOrderService.GetPurchaseOrderByIdAsync(id);
            if (order == null)
                return NotFound();

            return Ok(order);
        }

        [HttpPost("product")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductV3Dto dto)
        {
            var result = await _purchaseOrderService.CreateProductAsync(dto);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderDto dto)
        {
            var orderId = await _purchaseOrderService.CreatePurchaseOrderAsync(dto);
            return Ok(new { id = orderId });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _purchaseOrderService.DeletePurchaseOrderAsync(id);
            if (!result)
                return NotFound(new { message = "Purchase order not found." });

            return Ok(new { message = "Deleted successfully." });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePurchaseOrderDto dto)
        {
            var result = await _purchaseOrderService.UpdatePurchaseOrderAsync(id, dto);
            if (!result)
                return NotFound(new { message = "Không tìm thấy đơn hàng mua để cập nhật." });

            return Ok(new { message = "Cập nhật thành công." });
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdatePurchaseOrderStatusDto dto)
        {
            try
            {
                var result = await _purchaseOrderService.UpdatePurchaseOrderStatusAsync(id, dto.Status);
                if (!result)
                    return NotFound(new { message = "Không tìm thấy đơn hàng mua với ID " + id });

                return Ok(new { message = "Cập nhật trạng thái đơn hàng mua thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái đơn hàng mua", error = ex.Message });
            }
        }

        [HttpPost("{id}/import")]
        public async Task<IActionResult> ImportPurchaseOrder(int id)
        {
            var success = await _purchaseOrderService.ImportPurchaseOrderAsync(id);
            if (!success)
                return BadRequest("Invalid order or already imported.");

            return Ok("Order imported successfully.");
        }

    }
}
