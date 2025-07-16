using SEP490.DB.Models;
using SEP490.Modules.OrderModule.ManageOrder.DTO;

namespace SEP490.Modules.OrderModule.ManageOrder.Services
{
    public interface IOrderService
    {
        List<OrderDto> GetAllOrders();
        OrderDetailDto? GetOrderDetailById(int orderId);
        bool UpdateOrderDetailById(int orderId, UpdateOrderDetailDto dto);
        void DeleteOrder(int orderId);
        List<GlassStructureDto> GetAllGlassStructures();
        List<CustomerSearchResultDto> SearchCustomers(string keyword);
        //int CreateOrder(CreateOrderDto dto);
        Task<int> CreateOrderAsync(CreateOrderDto dto);

        string GetNextOrderCode();
        Task<Product> CreateProductAsync(CreateProductV2Dto dto);
    }

}
