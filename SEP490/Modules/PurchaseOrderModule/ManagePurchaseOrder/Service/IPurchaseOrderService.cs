using SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.DTO;

namespace SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.Service
{
    public interface IPurchaseOrderService
    {
        Task<List<PurchaseOrderDto>> GetAllPurchaseOrdersAsync();
        Task<PurchaseOrderWithDetailsDto?> GetPurchaseOrderByIdAsync(int id);
        Task<bool> DeletePurchaseOrderAsync(int id);

    }
}
