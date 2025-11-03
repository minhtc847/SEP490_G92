using SEP490.Modules.InventorySlipModule.DTOs;

namespace SEP490.Modules.InventorySlipModule.Services
{
    public interface IProductionOrderService
    {
        Task<bool> CheckAndUpdateCompletionAsync(int productionOrderId);

        Task<ProductionOrderInfoDto> GetProductionOrderInfoAsync(int productionOrderId);
    }
}
