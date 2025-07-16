using SEP490.DB.Models;
using SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.DTO;

namespace SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.Service
{
    public interface IPurchaseOrderService
    {
        Task<List<PurchaseOrderDto>> GetAllPurchaseOrdersAsync();
        Task<PurchaseOrderWithDetailsDto?> GetPurchaseOrderByIdAsync(int id);
        Task<bool> DeletePurchaseOrderAsync(int id);
        Task<int> CreatePurchaseOrderAsync(CreatePurchaseOrderDto dto);
        string GetNextPurchaseOrderCode();
        Task<Product> CreateProductAsync(CreateProductV3Dto dto);
        Task<bool> UpdatePurchaseOrderAsync(int id, UpdatePurchaseOrderDto dto);

    }
}
