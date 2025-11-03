using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface IGlueGlassOrderService
    {
        Task<bool> CreateGlueGlassOrderAsync(GlueGlassOrderDto request);
    }
} 