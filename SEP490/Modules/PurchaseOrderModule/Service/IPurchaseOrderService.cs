using SEP490.DB.Models;
using SEP490.Modules.PurchaseOrderModule.DTO;

namespace SEP490.Modules.PurchaseOrderModule.Service
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
        Task<bool> UpdatePurchaseOrderStatusAsync(int orderId, PurchaseStatus status);
        Task<bool> ChangeStatusToOrderedAsync(int orderId);


    }
}
