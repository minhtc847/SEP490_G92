using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
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
        public async Task<List<ProductionPlanDTO>> GetAllAsync()
        {
            return await _context.ProductionPlans
                .Include(p => p.Customer)
                .OrderByDescending(p => p.PlanDate)
                .Select(p => new ProductionPlanDTO
                {
                    Id = p.Id,                                         // Mã LXS
                    PlanDate = p.PlanDate.ToString("dd/MM/yyyy"),
                    OrderCode = p.OrderCode,                           // Mã ĐH
                    CustomerName = p.Customer.ContactPerson,
                    Quantity = p.Quantity,
                    Status = p.Status
                })
                .ToListAsync();
        }

        public async Task<List<ProductionPlanDetailDTO>> GetProductionPlanDetailsAsync(int planId)
        {
            var result = await _context.ProductionPlanDetails
                .Where(d => d.ProductionPlanId == planId)
                .Join(_context.Products,
                    detail => detail.ProductId,
                    product => product.Id,
                    (detail, product) => new { detail, product })
                .Join(_context.ProductionPlans,
                    c => c.detail.ProductionPlanId,
                    plan => plan.Id,
                    (c, plan) => new
                    {
                        plan.Id,
                        plan.Quantity,
                        c.product.ProductCode,
                        c.product.Thickness,
                        c.product.Width,
                        c.product.Height,
                        c.detail.Done
                    })
                .GroupBy(x => new
                {
                    x.Id,
                    x.Quantity,
                    x.ProductCode,
                    x.Thickness,
                    x.Width,
                    x.Height
                })
                .Select(g => new ProductionPlanDetailDTO
                {
                    Id = g.Key.Id,
                    ProductCode = g.Key.ProductCode,
                    Thickness = g.Key.Thickness,
                    Width = g.Key.Width,
                    Height = g.Key.Height,
                    Quantity = g.Key.Quantity,
                    Completed = g.Sum(x => x.Done),
                    InProgressQuantity = (g.Key.Quantity ?? 0) - g.Sum(x => x.Done)
                })
                .ToListAsync();

            return result;
        }

    }
}
