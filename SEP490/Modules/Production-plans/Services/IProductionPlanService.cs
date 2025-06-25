using SEP490.Modules.Production_plans.DTO;
using System.Threading.Tasks;

namespace SEP490.Modules.Production_plans.Services
{
    public interface IProductionPlanService
    {

        Task<int?> GetProducingQuantityAsync(int productionPlanId, int productId);
        Task<int?> GetDoneAsync(int productionPlanId, int productId);
    


        Task<List<ProductionPlanDTO>> GetAllAsync();
        Task<List<ProductionPlanDetailDTO>> GetProductionPlanDetailsAsync(int planId);
        Task CreateProductionPlanAsync(string orderCode, CreateProductionPlanInputDTO dto);
    }
}
