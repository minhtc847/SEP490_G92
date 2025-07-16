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

        public OrderController(SEP490DbContext context, IOrderService orderService)
        {
            _context = context;
            _orderService = orderService;
        }

        [HttpGet("all-customer-names")]
        public async Task<IActionResult> GetAllCustomerNames()
        {
            var names = await _context.Customers
                .Select(c => c.CustomerName)
                .ToListAsync();

            return Ok(names);
        }

        [HttpGet("all-product-names")]
        public async Task<IActionResult> GetAllProductNames()
        {
            var productNames = await _context.Products
                .Select(p => p.ProductName)
                .ToListAsync();

            return Ok(productNames);
        }


        [HttpGet("check-product-name")]
        public async Task<IActionResult> CheckProductName([FromQuery] string name)
        {
            bool exists = await _context.Products.AnyAsync(p => p.ProductName == name);
            return Ok(new { exists });
        }

        [HttpGet("glass-structures")]
        public IActionResult GetAllGlassStructures()
        {
            var result = _orderService.GetAllGlassStructures();
            return Ok(result);
        }

        [HttpPost("product")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductV2Dto dto)
        {
            var result = await _orderService.CreateProductAsync(dto);
            return Ok(result);
        }

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
                    ProductName = x.ProductName,
                }).ToListAsync();

            return Ok(structures);
        }

        [HttpGet("search-customer")]
        public IActionResult SearchCustomer(string? query)
        {
            query = query?.Trim() ?? string.Empty;

            var result = _context.Customers
                .AsNoTracking()
                .Where(c => !c.IsSupplier &&                            
                            (query == ""                                  
                             || EF.Functions.Like(c.CustomerCode!, $"%{query}%")  
                             || EF.Functions.Like(c.CustomerName!, $"%{query}%"))) 
                .Select(c => new
                {
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

        [HttpGet("search-supplier")]
        public IActionResult SearchSupplier(string? query)
        {
            query = query?.Trim() ?? string.Empty;

            var result = _context.Customers
                .AsNoTracking()
                .Where(c => c.IsSupplier &&                                     
                            (query == ""                                        
                             || EF.Functions.Like(c.CustomerName!, $"%{query}%")))
                .Select(c => new
                {
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
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            try
            {
                var orderId = await _orderService.CreateOrderAsync(dto);
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

        [HttpGet("search-nvl")]
        public IActionResult SearchRawMaterials(string query)
        {
            var result = _context.Products
                .Where(p =>
                    (p.ProductCode.Contains(query) || p.ProductName.Contains(query)) &&
                    p.ProductType == "NVL") 
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
