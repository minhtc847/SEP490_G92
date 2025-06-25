using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface IProductionOrdersService
    {

        Task<ProductionOrder> CreateProductionOrderAsync(ProductionOrderCreateRequest request);
        Task<int?> GetGlassLayersByProductIdAsync(int productId);
        Task<List<string>> ExtractGlassTypesAsync(int productId);
        Task<List<ProductionMaterial>> AddMaterialsByGlassTypeAsync(int productId, int productionId);
        Task<List<ProductionOutputDto>> GetProductionOutputsAsync(int productionOrderId);
        Task<ProductionOrder?> GetProductionOrderByIdAsync(int productionOrderId);
        Task<List<ProductionOrdersByPlanDto>> GetProductionOrdersByPlanIdAsync(int productionPlanId);

        public List<ProductionOrderListDto> GetAll();
        public List<ProductionOrderDetailDto> GetDetailsByProductionOrderId(int productionOrderId);
        public ProductCalculationDto CalculateProduct(int productionOrderId, int productId);
    }
}
