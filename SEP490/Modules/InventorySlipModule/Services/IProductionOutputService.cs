using SEP490.Modules.InventorySlipModule.DTOs;

namespace SEP490.Modules.InventorySlipModule.Services
{
    public interface IInventoryProductionOutputService
    {
        Task<bool> UpdateFinishedQuantityAsync(int productionOutputId, decimal finishedQuantity);
        Task<List<ProductionOutputDto>> GetByProductionOrderIdAsync(int productionOrderId);
    }
}
