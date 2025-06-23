using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface IProductionOrdersService
    {
        public List<ProductionOrderListDto> GetAll();
    }
}
