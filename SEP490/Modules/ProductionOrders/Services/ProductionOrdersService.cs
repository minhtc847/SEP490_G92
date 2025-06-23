using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.Services;
using SEP490.Modules.ProductionOrders.DTO;
using Microsoft.EntityFrameworkCore;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class ProductionOrdersService : BaseService, IProductionOrdersService
    {
        private readonly SEP490DbContext _context;
        public ProductionOrdersService(SEP490DbContext context)
        {
            _context = context;
        }
        public List<ProductionOrderListDto> GetAll()
        {
            return _context.ProductionOrders
                .Include(po => po.ProductionPlan)
                    .ThenInclude(pp => pp.Customer)
                .Include(po => po.ProductionPlan)
                    .ThenInclude(pp => pp.PurchaseOrder)
                .Select(po => new ProductionOrderListDto
                {
                    ProductionOrderCode = po.ProductionOrderCode,
                    OrderCode = po.ProductionPlan.PurchaseOrder.OrderCode,
                    CustomerName = po.ProductionPlan.Customer.CustomerName,
                    TotalAmount = _context.ProductionOutputs
                        .Where(poOut => poOut.ProductionOrderId == po.Id)
                        .Sum(poOut => (int?)poOut.Amount ?? 0)
                })
                .ToList();
        }
    }
}
