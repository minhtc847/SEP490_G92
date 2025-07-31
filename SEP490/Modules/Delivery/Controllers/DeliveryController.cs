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


    }
} 