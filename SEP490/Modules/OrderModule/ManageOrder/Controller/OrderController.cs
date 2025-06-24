using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.OrderModule.ManageOrder.Services;
using SEP490.Modules.OrderModule.ManageOrder.DTO;

namespace SEP490.Modules.OrderModule.ManageOrder.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        // GET: api/orders
        [HttpGet]
        public ActionResult<List<OrderDto>> GetAllOrders()
        {
            var orders = _orderService.GetAllOrders();
            if (orders == null || !orders.Any())
            {
                return NotFound("No orders found.");
            }
            return Ok(orders);
        }

        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public ActionResult<OrderDetailDto> GetOrderDetail(int id)
        {
            var orderDetail = _orderService.GetOrderDetailById(id);
            if (orderDetail == null)
            {
                return NotFound($"Order with ID {id} not found.");
            }

            return Ok(orderDetail);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateOrderDetail(int id, [FromBody] UpdateOrderDetailDto dto)
        {
            var success = _orderService.UpdateOrderDetailById(id, dto);
            if (!success)
                return NotFound($"Order with ID {id} not found.");

            return Ok("Order updated successfully.");
        }


        [HttpDelete("{id}")]
        public IActionResult DeleteOrder(int id)
        {
            try
            {
                _orderService.DeleteOrder(id);
                return Ok("Order deleted successfully.");
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
