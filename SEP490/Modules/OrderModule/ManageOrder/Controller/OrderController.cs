using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.Modules.OrderModule.ManageOrder.Services;
using SEP490.DB.Models;
using SEP490.DB;

namespace SEP490.Modules.OrderModule.ManageOrder.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly SEP490DbContext _context;
        private readonly IOrderService _orderService;

        public OrderController(SEP490DbContext context, IOrderService orderService)
        {
            _context = context;
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

        [HttpGet("/api/glass-structures")]
        public async Task<IActionResult> GetAllStructures()
        {
            var structures = await _context.GlassStructures
                .Select(x => new GlassStructureDto
                {
                    Id = x.Id,
                    ProductCode = x.ProductCode,
                    Category = x.Category,
                }).ToListAsync();

            return Ok(structures);
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
