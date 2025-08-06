using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.SaleOrders.DTO;
using SEP490.Modules.SaleOrders.Services;

namespace SEP490.Modules.SaleOrders.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ZaloOrderController : ControllerBase
    {
        private readonly IZaloOrderService _zaloOrderService;

        public ZaloOrderController(IZaloOrderService zaloOrderService)
        {
            _zaloOrderService = zaloOrderService;
        }

        /// <summary>
        /// Tạo đơn hàng từ Zalo
        /// </summary>
        /// <param name="request">Thông tin đơn hàng từ Zalo</param>
        /// <returns>Thông tin đơn hàng đã tạo</returns>
        [HttpPost("create")]
        public async Task<ActionResult<ZaloOrderResponseDto>> CreateOrder([FromBody] ZaloOrderRequestDto request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new ZaloOrderResponseDto
                    {
                        Success = false,
                        Message = "Dữ liệu đầu vào không hợp lệ"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.PhoneNumber))
                {
                    return BadRequest(new ZaloOrderResponseDto
                    {
                        Success = false,
                        Message = "Số điện thoại không được để trống"
                    });
                }

                if (request.Items == null || !request.Items.Any())
                {
                    return BadRequest(new ZaloOrderResponseDto
                    {
                        Success = false,
                        Message = "Danh sách sản phẩm không được để trống"
                    });
                }

                // Validate each item
                foreach (var item in request.Items)
                {
                    if (string.IsNullOrWhiteSpace(item.ProductCode))
                    {
                        return BadRequest(new ZaloOrderResponseDto
                        {
                            Success = false,
                            Message = "Mã sản phẩm không được để trống"
                        });
                    }

                    if (string.IsNullOrWhiteSpace(item.Height) || string.IsNullOrWhiteSpace(item.Width))
                    {
                        return BadRequest(new ZaloOrderResponseDto
                        {
                            Success = false,
                            Message = "Kích thước sản phẩm không được để trống"
                        });
                    }

                    if (item.Thickness <= 0 || item.Quantity <= 0)
                    {
                        return BadRequest(new ZaloOrderResponseDto
                        {
                            Success = false,
                            Message = "Độ dày và số lượng phải lớn hơn 0"
                        });
                    }
                }

                var result = await _zaloOrderService.CreateOrderFromZaloAsync(request);

                if (result.Success)
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ZaloOrderResponseDto
                {
                    Success = false,
                    Message = $"Lỗi hệ thống: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Lấy thông tin chi tiết đơn hàng
        /// </summary>
        /// <param name="orderId">ID đơn hàng</param>
        /// <returns>Thông tin chi tiết đơn hàng</returns>
        [HttpGet("{orderId}")]
        public async Task<ActionResult<ZaloOrderDetailsDto>> GetOrderDetails(int orderId)
        {
            try
            {
                if (orderId <= 0)
                {
                    return BadRequest(new { message = "ID đơn hàng không hợp lệ" });
                }

                var orderDetails = await _zaloOrderService.GetOrderDetailsAsync(orderId);

                if (orderDetails == null)
                {
                    return NotFound(new { message = "Không tìm thấy đơn hàng" });
                }

                return Ok(orderDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi hệ thống: {ex.Message}" });
            }
        }

        /// <summary>
        /// API test endpoint để kiểm tra dữ liệu mẫu
        /// </summary>
        /// <returns>Dữ liệu mẫu</returns>
        [HttpGet("sample")]
        public ActionResult<ZaloOrderRequestDto> GetSampleData()
        {
            var sample = new ZaloOrderRequestDto
            {
                PhoneNumber = "0123456789",
                Items = new List<ZaloOrderItemDto>
                {
                    new ZaloOrderItemDto
                    {
                        ProductCode = "GL001",
                        Height = "1000",
                        Width = "800",
                        Thickness = 6.0m,
                        Quantity = 2
                    },
                    new ZaloOrderItemDto
                    {
                        ProductCode = "GL002", 
                        Height = "1200",
                        Width = "900",
                        Thickness = 8.0m,
                        Quantity = 1
                    }
                }
            };

            return Ok(sample);
        }
    }
}