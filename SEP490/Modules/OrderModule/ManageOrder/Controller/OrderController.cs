using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.Modules.OrderModule.ManageOrder.Services;
using System.Text.RegularExpressions;

namespace SEP490.Modules.OrderModule.ManageOrder.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly SEP490DbContext _context;
        private readonly IOrderService _orderService;
        private readonly IOrderService _customerService;

        public OrderController(SEP490DbContext context, IOrderService orderService, IOrderService customerService)
        {
            _context = context;
            _orderService = orderService;
            _customerService = customerService;
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

        [HttpGet("search-customer")]
        public IActionResult SearchCustomer(string query)
        {
            var result = _context.Customers
                .Where(c => c.CustomerCode.Contains(query) || c.CustomerName.Contains(query))
                .Select(c => new {
                    c.Id,
                    c.CustomerCode,
                    c.CustomerName,
                    c.Address,
                    c.Phone,
                    c.Discount
                })
                .ToList();

            return Ok(result);
        }

        [HttpGet("next-order-code")]
        public IActionResult GetNextOrderCode()
        {
            var nextCode = _orderService.GetNextOrderCode();
            return Ok(new { nextOrderCode = nextCode });
        }

        [HttpPost]
        public IActionResult CreateOrder([FromBody] CreateOrderDto dto)
        {
            try
            {
                var orderId = _orderService.CreateOrder(dto); 
                if (orderId <= 0) 
                {
                    return BadRequest("Tạo đơn hàng thất bại.");
                }
                return Ok(new { message = "Tạo đơn hàng thành công.", id = orderId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { title = ex.Message });
            }
        }


        [HttpGet("search")]
        public IActionResult SearchProducts(string query)
        {
            var result = _context.Products
                .Where(p =>
                    (p.ProductCode.Contains(query) || p.ProductName.Contains(query)) &&
                    p.ProductType == "Thành phẩm")
                .Select(p => new
                {
                    p.Id,
                    p.ProductCode,
                    p.ProductName,
                    p.Height,
                    p.Width,
                    p.Thickness,
                    p.UnitPrice,
                    p.GlassStructureId
                })
                .ToList();

            return Ok(result);
        }

        [HttpGet("check-code")]
        public IActionResult CheckProductCode(string code)
        {
            var exists = _context.Products.Any(p => p.ProductCode == code);
            return Ok(new { exists });
        }


        // GET: api/orders/{id}
        [HttpGet("{id}")]
        public ActionResult<OrderDetailDto> GetOrderDetail(int id)
        {
            var orderDetail = _orderService.GetOrderDetailById(id);
            if (orderDetail == null)
            {
                return NotFound($"Không tìm thấy đơn hàng với ID {id}.");
            }

            return Ok(orderDetail);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateOrderDetail(int id, [FromBody] UpdateOrderDetailDto dto)
        {
            var success = _orderService.UpdateOrderDetailById(id, dto);
            if (!success)
                return NotFound($"Không tìm thấy đơn hàng với ID {id}.");

            return Ok("Đơn hàng đã được cập nhật thành công.");
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteOrder(int id)
        {
            try
            {
                _orderService.DeleteOrder(id);
                return Ok("Đã xoá đơn hàng thành công.");
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}
