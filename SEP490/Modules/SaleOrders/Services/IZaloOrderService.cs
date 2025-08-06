using SEP490.Modules.SaleOrders.DTO;

namespace SEP490.Modules.SaleOrders.Services
{
    public interface IZaloOrderService
    {
        Task<ZaloOrderResponseDto> CreateOrderFromZaloAsync(ZaloOrderRequestDto request);
        Task<ZaloOrderDetailsDto?> GetOrderDetailsAsync(int orderId);
    }
}