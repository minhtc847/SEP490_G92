using SEP490.Modules.Production_plans.DTO;
using System.Threading.Tasks;

namespace SEP490.Modules.Production_plans.Services
{
    public interface IProductionPlanService
    {
        Task<List<ProductionPlanDTO>> GetProductionPlanListAsync();
        Task<ProductionPlanDetailViewDTO?> GetProductionPlanDetailAsync(int id);
        Task<List<ProductionPlanProductDetailDTO>> GetProductionPlanProductDetailsAsync(int id);
        Task<ProductionPlanDetailViewDTO> CreateProductionPlanFromSaleOrderAsync(CreateProductionPlanFromSaleOrderDTO dto);
        Task<ProductionPlanMaterialDetailDTO> GetProductionPlanMaterialDetailAsync(int id);
        Task<List<ProductionPlanOutputDto>> GetProductionPlanOutputsAsync(int productionPlanId);
        Task<bool> DeleteProductionPlanAsync(int id);
        Task<bool> HasProductionPlanAsync(int saleOrderId);
        Task<bool> CompleteProductionPlanAsync(int id);
    }
}
