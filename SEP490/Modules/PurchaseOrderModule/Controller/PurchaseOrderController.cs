using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.Modules.PurchaseOrderModule.DTO;
using SEP490.Modules.PurchaseOrderModule.Service;
using SEP490.Selenium.PO;
using SEP490.Selenium.PO.DTO;

namespace SEP490.Modules.PurchaseOrderModule.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseOrderController : ControllerBase
    {
        private readonly IPurchaseOrderService _purchaseOrderService;
        private readonly IMisaPOService _misaPOService;

        public PurchaseOrderController(IPurchaseOrderService purchaseOrderService, IMisaPOService misaPOService)
        {
            _purchaseOrderService = purchaseOrderService;
            _misaPOService = misaPOService;
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

        [HttpPut("{id}/update-misa")]
        public async Task<IActionResult> UpdateMisaPurchaseOrder(int id)
        {
            try
            {
                // Validate that all products in the purchase order have been updated to MISA
                var validation = await _purchaseOrderService.ValidateProductsForMisaUpdateAsync(id);
                if (!validation.IsValid)
                {
                    return BadRequest(new { message = validation.Message });
                }

                // Get the purchase order details
                var order = await _purchaseOrderService.GetPurchaseOrderByIdAsync(id);
                if (order == null)
                    return NotFound("Purchase order not found.");

                // Create InputPO for MISA
                var inputPO = new InputPO
                {
                    supplierName = order.CustomerName ?? "",
                    date = order.Date?.ToString("dd/MM/yyyy") ?? DateTime.Now.ToString("dd/MM/yyyy"),
                    ProductsInput = order.PurchaseOrderDetails.Select(detail =>
                    {
                        var unitPrice = detail.UnitPrice ?? 0m;
                        var formattedPrice = Math.Round(unitPrice, 0, MidpointRounding.AwayFromZero)
                            .ToString(System.Globalization.CultureInfo.InvariantCulture);
                        return new SEP490.Selenium.SaleOrder.DTO.SaleOrderProductsInput
                        {
                            ProductCode = detail.ProductName ?? "",
                            ProductQuantity = (detail.Quantity ?? 0).ToString(System.Globalization.CultureInfo.InvariantCulture),
                            Price = formattedPrice
                        };
                    }).ToList()
                };

                // Call MISA service
                _misaPOService.Add(inputPO);

                // Update the isUpdateMisa flag in database
                var success = await _purchaseOrderService.UpdateMisaPurchaseOrderAsync(id);
                if (!success)
                    return BadRequest("Failed to update MISA status.");

                return Ok("MISA updated successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating MISA", error = ex.Message });
            }
        }

        [HttpGet("{id}/check-products-misa")]
        public async Task<IActionResult> CheckPurchaseOrderProductsMisaStatus(int id)
        {
            try
            {
                var validation = await _purchaseOrderService.ValidateProductsForMisaUpdateAsync(id);
                return Ok(new
                {
                    success = true,
                    canUpdateMisa = validation.IsValid,
                    message = validation.Message
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Lỗi khi kiểm tra trạng thái MISA của sản phẩm", error = ex.Message });
            }
        }

    }
}
