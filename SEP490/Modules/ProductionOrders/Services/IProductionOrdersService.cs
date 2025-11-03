using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface IProductionOrdersService
    {
        Task<List<ProductionOrdersByPlanDto>> GetProductionOrdersByPlanIdAsync(int productionPlanId);
        Task<List<ProductionOrdersByPlanDto>> GetAllProductionOrdersAsync();

        Task<List<ProductionOutputDto>> GetProductionOutputsByOrderIdAsync(int productionOrderId);
        Task<bool> ReportBrokenOutputAsync(int outputId, ReportBrokenOutputDto dto);

        Task<List<ProductionDefectDto>> GetProductionDefectsByOrderIdAsync(int productionOrderId);
        Task<bool> CreateDefectReportAsync(CreateDefectReportDto dto);
        Task<bool> UpdateDefectReportAsync(int defectId, UpdateDefectReportDto dto);
        Task<string?> GetProductionPlanStatusAsync(int productionOrderId);
    }
}
