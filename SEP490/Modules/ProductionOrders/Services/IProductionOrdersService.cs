using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface IProductionOrdersService
    {
        Task<List<ProductionOrdersByPlanDto>> GetProductionOrdersByPlanIdAsync(int productionPlanId);
        Task<List<ProductionOrdersByPlanDto>> GetAllProductionOrdersAsync();
    }
}
