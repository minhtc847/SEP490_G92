using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Accountant.DTO;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Modules.ProductionOrders.Services;

namespace SEP490.Modules.Accountant.Services
{
    public class ProductionAccountantService : BaseService, IProductionAccountantService
    {
        private readonly SEP490DbContext _context;
        public ProductionAccountantService(SEP490DbContext context)
        {
            _context = context;
        }

        public List<AccountantDTO> GetAll()
        {
            return _context.ProductionOrders
                .Include(po => po.ProductionPlan)
                    .ThenInclude(pp => pp.Customer)
                .Include(po => po.ProductionPlan)
                    .ThenInclude(pp => pp.SaleOrder)
                .Select(po => new AccountantDTO
                {
                    ProductionOrderId = po.Id,
                    ProductionOrderCode = po.ProductionOrderCode,
                    OrderCode = po.ProductionPlan.SaleOrder.OrderCode,
                    CustomerName = po.ProductionPlan.Customer.CustomerName,
                    TotalAmount = _context.ProductionOutputs
                        .Where(poOut => poOut.ProductionOrderId == po.Id)
                        .Sum(poOut => (int?)poOut.Amount ?? 0),
                    Status = po.ProductionStatus
                })
                .ToList();
        }

        public List<ProductionOrderProductDTO> GetProductsByProductionOrderId(int productionOrderId)
        {
            var products = _context.ProductionOrderDetails
                .Where(d => d.ProductionOrder.Id == productionOrderId)
                .Include(d => d.Product)
                .Select(d => new ProductionOrderProductDTO
                {
                    ProductCode = d.Product.ProductCode,
                    ProductName = d.Product.ProductName,
                    Uom = d.Product.UOM,
                    Quantity = d.Quantity
                })
                .ToList();

            return products;
        }

        public async Task<List<ProductWithMaterialsDTO>> GetProductAndMaterialByProductionOrderId(int productionOrderId)
        {
            var details = await _context.ProductionOrderDetails
                .Where(d => d.Id == productionOrderId)
                .Include(d => d.Product)
                .ToListAsync();

            var result = details.Select(detail => new ProductWithMaterialsDTO
            {
                Product = new ProductionOrderProductDTO
                {
                    ProductCode = detail.Product?.ProductCode,
                    ProductName = detail.Product?.ProductName,
                    Uom = detail.Product?.UOM,
                    Quantity = detail.Quantity
                },
                Materials = _context.ProductionMaterials
                    .Where(m => m.ProductionName == detail.Product.ProductCode)
                    .Select(m => new MaterialAccountantDTO
                    {
                        ProductCode = m.CostObject,
                        ProductName = m.CostItem,
                        Uom = m.UOM,
                        QuantityPer = m.Amount ?? 0,
                        TotalQuantity = (m.Amount ?? 0) * detail.Quantity
                    }).ToList()

            }).ToList();

            return result;
        }

        public async Task<ProductWithMaterialsDTO?> GetProductAndMaterialByCode(int productionOrderId, string productCode)
        {
            productCode = productCode?.ToUpper().Trim();
            Console.WriteLine($"🎯 Normalized ProductCode: '{productCode}'");

            var details = await _context.ProductionOrderDetails
                .Include(d => d.Product)
                .Include(d => d.ProductionOrder)
                .Where(d =>
                    d.ProductionOrder != null &&
                    d.ProductionOrder.Id == productionOrderId &&
                    d.Product.ProductCode.ToUpper() == productCode)
                .ToListAsync();

            if (details == null || details.Count == 0)
                return null;

            var totalQuantity = details.Sum(d => d.Quantity);

            var materials = await _context.ProductionMaterials
                .Include(m => m.Product)
                .Where(m => m.ProductionName.ToUpper() == productCode)
                .GroupBy(m => new { m.CostObject, m.CostItem, m.UOM })
                .Select(g => new MaterialAccountantDTO
                {
                    ProductCode = g.Key.CostObject,
                    ProductName = g.Key.CostItem,
                    Uom = g.Key.UOM,
                    QuantityPer = g.Sum(m => m.Amount ?? 0),
                    TotalQuantity = g.Sum(m => m.Amount ?? 0) * totalQuantity
                })
                .ToListAsync();

            return new ProductWithMaterialsDTO
            {
                Product = new ProductionOrderProductDTO
                {
                    ProductCode = details.First().Product.ProductCode,
                    ProductName = details.First().Product.ProductName,
                    Uom = details.First().Product.UOM,
                    Quantity = totalQuantity
                },
                Materials = materials
            };
        }

    }
}