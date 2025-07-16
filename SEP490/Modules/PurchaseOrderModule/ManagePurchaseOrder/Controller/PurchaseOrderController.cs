using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.DTO;
using SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.Service;

namespace SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.Controller
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


    }
}
