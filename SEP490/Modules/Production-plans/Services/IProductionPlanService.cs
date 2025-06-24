using SEP490.Modules.Production_plans.DTO;

namespace SEP490.Modules.Production_plans.Services
{
    public interface IProductionPlanService
    {
        Task<List<ProductionPlanDTO>> GetAllAsync();
        Task<List<ProductionPlanDetailDTO>> GetProductionPlanDetailsAsync(int planId);
        Task CreateProductionPlanAsync(string orderCode, CreateProductionPlanInputDTO dto);
    }
}
