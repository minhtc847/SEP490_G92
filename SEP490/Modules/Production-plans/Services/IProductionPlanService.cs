using SEP490.Modules.Production_plans.DTO;
using System.Threading.Tasks;

namespace SEP490.Modules.Production_plans.Services
{
    public interface IProductionPlanService
    {
        Task<List<ProductionPlanDTO>> GetProductionPlanListAsync();
        Task<ProductionPlanDetailViewDTO?> GetProductionPlanDetailAsync(int id);
        Task<List<ProductionPlanProductDetailDTO>> GetProductionPlanProductDetailsAsync(int id);
    }
}
