using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.Service;
using SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.DTO;

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

        [HttpGet("{id}")]
        public async Task<ActionResult<PurchaseOrderWithDetailsDto>> GetById(int id)
        {
            var order = await _purchaseOrderService.GetPurchaseOrderByIdAsync(id);
            if (order == null)
                return NotFound();

            return Ok(order);
        }



        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _purchaseOrderService.DeletePurchaseOrderAsync(id);
            if (!result)
                return NotFound(new { message = "Purchase order not found." });

            return Ok(new { message = "Deleted successfully." });
        }

    }
}
