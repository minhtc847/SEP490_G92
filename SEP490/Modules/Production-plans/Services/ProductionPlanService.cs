using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Production_plans.DTO;

namespace SEP490.Modules.Production_plans.Services
{
    public class ProductionPlanService : BaseService, IProductionPlanService
    {
        private readonly SEP490DbContext _context;
        public ProductionPlanService(SEP490DbContext context)
        {
            _context = context;
        }
        public async Task<List<ProductionPlanDTO>> GetProductionPlanListAsync()
        {
            var plans = await _context.ProductionPlans
                .Include(p => p.SaleOrder)
                    .ThenInclude(so => so.OrderDetails)
                        .ThenInclude(od => od.OrderDetailProducts)
                .Include(p => p.Customer)
                .Select(p => new ProductionPlanDTO
                {
                    Id = p.Id,
                    PlanDate = p.PlanDate.ToString("yyyy-MM-dd"),
                    OrderCode = "DH" + p.SaleOrder.Id,
                    CustomerName = p.Customer.CustomerName ?? string.Empty,
                    Quantity = p.SaleOrder.OrderDetails
                        .SelectMany(od => od.OrderDetailProducts)
                        .Sum(odp => odp.Quantity ?? 0),
                    Status = p.Status
                })
                .ToListAsync();
            return plans;
        }
        public async Task<ProductionPlanDetailViewDTO?> GetProductionPlanDetailAsync(int id)
        {
            var plan = await _context.ProductionPlans
                .Include(p => p.Customer)
                .Include(p => p.SaleOrder)
                .Include(p => p.ProductionPlanDetails)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (plan == null) return null;

            return new ProductionPlanDetailViewDTO
            {
                CustomerName = plan.Customer.CustomerName ?? "",
                Address = plan.Customer.Address,
                Phone = plan.Customer.Phone,
                OrderCode = "DH" + plan.SaleOrder.Id,
                OrderDate = plan.SaleOrder.OrderDate,
                DeliveryStatus = plan.SaleOrder.DeliveryStatus,
                PlanDate = plan.PlanDate,
                Status = plan.Status,
                Quantity = plan.Quantity,
                Done = plan.ProductionPlanDetails.Sum(x => x.Done)
            };
        }

        public async Task<List<ProductionPlanProductDetailDTO>> GetProductionPlanProductDetailsAsync(int id)
        {
            var productDetails = await _context.ProductionPlanDetails
                .Include(pd => pd.Product)
                .Where(pd => pd.ProductionPlanId == id)
                .Select(pd => new ProductionPlanProductDetailDTO
                {
                    Id = pd.Id,
                    ProductName = pd.Product.ProductName ?? string.Empty,
                    TotalQuantity = pd.Quantity,
                    InProduction = pd.Producing ?? 0,
                    Completed = pd.Done,
                    DaCatKinh = pd.DaCatKinh ?? 0,
                    DaTronKeo = pd.DaTronKeo ?? 0,
                    DaGiao = pd.DaGiao ?? 0
                })
                .ToListAsync();

            return productDetails;
        }
    }
}
