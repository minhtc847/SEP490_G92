using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface ICutGlassOrderService
    {
        Task<bool> CreateCutGlassOrderAsync(CutGlassOrderDto request);
    }
} 