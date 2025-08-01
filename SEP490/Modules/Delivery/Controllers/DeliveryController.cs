using Microsoft.AspNetCore.Mvc;
using SEP490.DB.Models;
using SEP490.Modules.Delivery.DTO;
using SEP490.Modules.Delivery.Services;

namespace SEP490.Modules.Delivery.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DeliveryController : ControllerBase
    {
        private readonly IDeliveryService _deliveryService;

        public DeliveryController(IDeliveryService deliveryService)
        {
            _deliveryService = deliveryService;
        }

        [HttpGet]
        public async Task<ActionResult<List<DeliveryDto>>> GetAllDeliveries()
        {
            try
            {
                var deliveries = await _deliveryService.GetAllDeliveriesAsync();
                return Ok(deliveries);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tải danh sách phiếu giao hàng", error = ex.Message });
            }
        }

        [HttpGet("validation/{salesOrderId}")]
        public async Task<ActionResult<List<DeliveryValidationItem>>> GetProductionPlanValidation(int salesOrderId)
        {
            try
            {
                var validation = await _deliveryService.GetProductionPlanValidationAsync(salesOrderId);
                return Ok(validation);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy thông tin kiểm tra", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<DeliveryDto>> CreateDelivery([FromBody] CreateDeliveryDto dto)
        {
            try
            {
                var delivery = await _deliveryService.CreateDeliveryAsync(dto);
                
                // Return the created delivery as DTO
                var deliveryDto = new DeliveryDto
                {
                    Id = delivery.Id,
                    SalesOrderId = delivery.SalesOrderId,
                    OrderCode = "", // Will be populated when loaded with includes
                    CustomerName = "", // Will be populated when loaded with includes
                    DeliveryDate = delivery.DeliveryDate,
                    ExportDate = delivery.ExportDate,
                    Status = delivery.Status,
                    Note = delivery.Note,
                    CreatedAt = delivery.CreatedAt,
                    TotalAmount = 0 // Will be calculated when loaded with includes
                };

                return CreatedAtAction(nameof(GetAllDeliveries), deliveryDto);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi tạo phiếu giao hàng", error = ex.Message });
            }
        }


    }
} 