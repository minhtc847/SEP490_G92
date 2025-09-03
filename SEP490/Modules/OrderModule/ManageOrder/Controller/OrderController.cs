using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SEP490.Common.Attributes;
using SEP490.Common.Constants;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Hubs;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.Modules.OrderModule.ManageOrder.Services;
using System.Text.RegularExpressions;

namespace SEP490.Modules.OrderModule.ManageOrder.Controllers
{
    [Route("api/orders")]
    [ApiController]
    [Authorize] // Yêu cầu authentication
    public class OrderController : ControllerBase
    {
        private readonly SEP490DbContext _context;
        private readonly IOrderService _orderService;
        private readonly IHubContext<SaleOrderHub> _hubContext;

        public OrderController(SEP490DbContext context, IOrderService orderService, IHubContext<SaleOrderHub> hubContext)
        {
            _context = context;
            _orderService = orderService;
            _hubContext = hubContext;
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
        [AuthorizeRoles(Roles.MANAGER, Roles.ACCOUNTANT)]
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
        [AuthorizeRoles( Roles.MANAGER, Roles.ACCOUNTANT)]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            try
            {
                var orderId = await _orderService.CreateOrderAsync(dto);
                if (orderId <= 0)
                {
                    return BadRequest("Tạo đơn hàng thất bại.");
                }
                var role = User.FindFirst("roleName")?.Value ?? "Kế toán";
                string message;

                switch (role)
                {
                    case "Chủ xưởng":
                        message = "Chủ xưởng vừa tạo đơn bán hàng";
                        break;
                    case "Kế toán":
                        message = "Kế toán vừa tạo đơn bán hàng";
                        break;
                    default:
                        message = $"{role} vừa tạo đơn bán hàng";
                        break;
                }

                var order = await _context.SaleOrders.FindAsync(orderId);
                var orderCode = order?.OrderCode ?? "N/A";

                await _hubContext.Clients.All.SendAsync("SaleOrderCreated", new
                {
                    message = message,
                    orderCode = orderCode,
                    createAt = DateTime.Now.ToString("HH:mm:ss dd/MM/yyyy")
                });

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
                    p.GlassStructureId,
                    p.UOM
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
                    p.GlassStructureId,
                    p.UOM
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
        [AuthorizeRoles( Roles.MANAGER,Roles.ACCOUNTANT)]
        public ActionResult<OrderDetailDto> GetOrderDetail(int id)
        {
            var orderDetail = _orderService.GetOrderDetailById(id);
            if (orderDetail == null)
            {
                return NotFound($"Không tìm thấy đơn hàng với ID {id}.");
            }

            return Ok(orderDetail);
        }

        // GET: api/orders/{id}/detail
        [HttpGet("{id}/detail")]
        public ActionResult<object> GetOrderDetailForDelivery(int id)
        {
            var orderDetail = _orderService.GetOrderDetailById(id);
            if (orderDetail == null)
            {
                return NotFound($"Không tìm thấy đơn hàng với ID {id}.");
            }

            // Transform to match SalesOrderDetail interface
            var result = new
            {
                id = id,
                orderCode = orderDetail.OrderCode,
                orderDate = orderDetail.OrderDate,
                customer = new
                {
                    id = 0, // We don't have customer ID in OrderDetailDto, but it's not critical for delivery
                    customerName = orderDetail.CustomerName,
                    address = orderDetail.Address,
                    phone = orderDetail.Phone
                },
                products = orderDetail.Products.Select(p => new
                {
                    id = p.ProductId,
                    productName = p.ProductName,
                    width = p.Width,
                    height = p.Height,
                    thickness = p.Thickness,
                    quantity = p.Quantity,
                    unitPrice = p.UnitPrice
                }).ToList(),
                totalAmount = orderDetail.TotalAmount
            };

            return Ok(result);
        }

        [HttpPut("{id}")]
        [AuthorizeRoles( Roles.MANAGER, Roles.ACCOUNTANT)]
        public IActionResult UpdateOrderDetail(int id, [FromBody] UpdateOrderDetailDto dto)
        {
            var success = _orderService.UpdateOrderDetailById(id, dto);
            if (!success)
                return NotFound($"Không tìm thấy đơn hàng với ID {id}.");

            return Ok("Đơn hàng đã được cập nhật thành công.");
        }

        [HttpPut("{id}/status")]
        [AuthorizeRoles( Roles.MANAGER, Roles.ACCOUNTANT)]
        public IActionResult UpdateOrderStatus(int id, [FromBody] UpdateOrderStatusDto dto)
        {
            try
            {
                var success = _orderService.UpdateOrderStatus(id, dto.Status);
                if (!success)
                    return NotFound($"Không tìm thấy đơn hàng với ID {id}.");

                return Ok(new { message = "Cập nhật trạng thái đơn hàng thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi cập nhật trạng thái đơn hàng", error = ex.Message });
            }
        }

        [HttpPut("{id}/update-misa-status")]
        [AuthorizeRoles(Roles.MANAGER, Roles.ACCOUNTANT)]
        public IActionResult UpdateOrderMisaStatus(int id)
        {
            try
            {
                var success = _orderService.UpdateOrderMisaStatus(id);
                if (!success)
                    return NotFound($"Không tìm thấy đơn hàng với ID {id}.");

                return Ok(new { message = "Cập nhật trạng thái MISA thành công!", isUpdateMisa = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Cập nhật trạng thái MISA thất bại!", error = ex.Message });
            }
        }

        [HttpGet("{id}/misa-data")]
        [AuthorizeRoles(Roles.MANAGER, Roles.ACCOUNTANT)]
        public IActionResult GetOrderMisaData(int id)
        {
            try
            {
                var orderData = _orderService.GetOrderDataForMisa(id);
                if (orderData == null)
                    return NotFound($"Không tìm thấy đơn hàng với ID {id}.");

                return Ok(orderData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy dữ liệu đơn hàng cho MISA", error = ex.Message });
            }
        }

        [HttpGet("{id}/check-products-misa")]
        [AuthorizeRoles(Roles.MANAGER, Roles.ACCOUNTANT)]
        public IActionResult CheckOrderProductsMisaStatus(int id)
        {
            try
            {
                var result = _orderService.CheckOrderProductsMisaStatus(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi kiểm tra trạng thái MISA của sản phẩm", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [AuthorizeRoles(Roles.MANAGER)]
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