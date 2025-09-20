using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.Dashboard.DTO;
using SEP490.Modules.Dashboard.Services;

namespace SEP490.Modules.Dashboard.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductionDashboardController : ControllerBase
    {
        private readonly IProductionDashboardService _dashboardService;

        public ProductionDashboardController(IProductionDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("production/overview")]
        public async Task<IActionResult> GetProductionOverview([FromQuery] string? fromDate = null, [FromQuery] string? toDate = null)
        {
            try
            {
                var overview = await _dashboardService.GetProductionOverviewAsync(fromDate, toDate);
                return Ok(overview);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy tổng quan sản xuất", error = ex.Message });
            }
        }

        // Order Details APIs
        [HttpGet("orders")]
        public async Task<IActionResult> GetOrdersList()
        {
            try
            {
                var orders = await _dashboardService.GetOrdersListAsync();
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy danh sách đơn hàng", error = ex.Message });
            }
        }

        [HttpGet("orders/{orderId}/details")]
        public async Task<IActionResult> GetOrderDetails(int orderId)
        {
            try
            {
                var orderDetails = await _dashboardService.GetOrderDetailsAsync(orderId);
                return Ok(orderDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi khi lấy chi tiết đơn hàng", error = ex.Message });
            }
        }
    }
}