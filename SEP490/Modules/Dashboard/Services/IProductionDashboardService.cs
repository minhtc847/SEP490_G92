using SEP490.Modules.Dashboard.DTO;

namespace SEP490.Modules.Dashboard.Services
{
    public interface IProductionDashboardService
    {
        // Tổng quan
        Task<ProductionDashboardOverviewDTO> GetProductionOverviewAsync(string? fromDate = null, string? toDate = null);
        
        // Order Details
        Task<List<OrderDetailDTO>> GetOrdersListAsync();
        Task<OrderDetailDTO> GetOrderDetailsAsync(int orderId);
    }
}
