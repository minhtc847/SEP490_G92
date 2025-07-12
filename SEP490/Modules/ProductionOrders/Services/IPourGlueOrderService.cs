using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface IPourGlueOrderService
    {
        Task<bool> CreatePourGlueOrderAsync(PourGlueOrderDto request);
    }
} 