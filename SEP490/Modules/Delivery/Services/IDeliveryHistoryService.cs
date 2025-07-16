using SEP490.Modules.Delivery.DTO;

namespace SEP490.Modules.Delivery.Services
{
    public interface IDeliveryHistoryService
    {
        Task<List<DeliveryOrderDto>> GetDeliveryOrdersByProductionPlanIdAsync(int productionPlanId);
        Task<List<DeliveryHistoryDto>> GetDeliveryHistoryByProductAsync(int productionPlanDetailId);
        Task<DeliveryHistoryDto> CreateDeliveryHistoryAsync(int productionPlanDetailId, CreateDeliveryHistoryDto dto);
    }
} 