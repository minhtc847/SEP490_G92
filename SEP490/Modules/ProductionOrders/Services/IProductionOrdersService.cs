using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface IProductionOrdersService
    {

        Task<List<ProductionOutputDto>> CreateProductionOutputsFromOrderAsync(int productionOrderId);
        
        Task<ProductionOrder?> CreateProductionOrderAsync(int planId);
        
       
       
        Task<List<ProductionOutputDto>> GetProductionOutputsAsync(int productionOrderId);
        Task<ProductionOrder?> GetProductionOrderByIdAsync(int productionOrderId);
        Task<List<ProductionOrdersByPlanDto>> GetProductionOrdersByPlanIdAsync(int productionPlanId);

        public List<ProductionOrderListDto> GetAll();
        public List<ProductionOrderDetailDto> GetDetailsByProductionOrderId(int productionOrderId);
        public ProductCalculationDto CalculateProduct(int productionOrderId, int productId);
    }
}
