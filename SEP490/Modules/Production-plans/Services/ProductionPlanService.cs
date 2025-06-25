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
                .Select(d => new
                {
                    d.ProductionPlanId,
                    Quantity = d.ProductionPlan.Quantity ?? 0,
                    ProductCode = d.Product.ProductCode,
                    ProductName = d.Product.ProductName,
                    Done = d.Done
                })
                .GroupBy(x => new
                {
                    x.ProductionPlanId,
                    x.Quantity,
                    x.ProductCode,
                    x.ProductName
                })
                .Select(g => new ProductionPlanDetailDTO
                {
                    Id = g.Key.ProductionPlanId,
                    ProductCode = g.Key.ProductCode,
                    ProductName = g.Key.ProductName,
                    Quantity = g.Key.Quantity,
                    Completed = g.Sum(x => x.Done),
                    InProgressQuantity = g.Key.Quantity - g.Sum(x => x.Done)
                })
                .ToListAsync();

            return result;
        }


        public async Task CreateProductionPlanAsync(string orderCode, CreateProductionPlanInputDTO dto)
        {
            var saleOrder = await _context.SaleOrders
                .Include(s => s.Customer)
                .FirstOrDefaultAsync(s => s.Id == dto.SaleOrderId);

            if (saleOrder == null)
                throw new Exception("Không tìm thấy đơn hàng");

            var plan = new ProductionPlan
            {
                PlanDate = DateTime.Now,
                OrderCode = dto.OrderCode,
                SaleOrderId = saleOrder.Id,
                CustomerId = dto.CustomerId,
                CustomerCode = saleOrder.CustomerCode,
                Quantity = 0, //cập nhật sau
                Status = dto.Status,
            };

            _context.ProductionPlans.Add(plan);
            await _context.SaveChangesAsync();

            int totalQuantity = 0;

            foreach (var item in dto.Details)
            {
                //  Kiểm tra ProductId 
                var productExists = await _context.Products.AnyAsync(p => p.Id == item.ProductId);
                if (!productExists)
                {
                    throw new Exception($"ProductId {item.ProductId} không tồn tại trong bảng Products.");
                }

                var detail = new ProductionPlanDetail
                {
                    ProductionPlanId = plan.Id,
                    ProductId = item.ProductId,
                    Producing = item.Producing,
                    Done = item.Done
                };

                _context.ProductionPlanDetails.Add(detail);
                totalQuantity += item.Producing + item.Done;
            }


            plan.Quantity = totalQuantity;
            _context.ProductionPlans.Update(plan);

            await _context.SaveChangesAsync();

        }
        public async Task UpdateStatusAsync(int planId, string newStatus)
        {
            var plan = await _context.ProductionPlans.FirstOrDefaultAsync(p => p.Id == planId);
            if (plan == null)
            {
                throw new Exception("Không tìm thấy kế hoạch sản xuất.");
            }

            plan.Status = newStatus;
            _context.ProductionPlans.Update(plan);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateProductionPlanDetailsByProductAsync(UpdateProductionPlanDetailsByProductDTO dto)
        {
            var plan = await _context.ProductionPlans
                .Include(p => p.ProductionPlanDetails)
                .FirstOrDefaultAsync(p => p.Id == dto.ProductionPlanId);

            if (plan == null)
                throw new Exception("Không tìm thấy kế hoạch sản xuất.");

            int totalQuantity = 0;

            foreach (var item in dto.Details)
            {
                var detail = plan.ProductionPlanDetails
                    .FirstOrDefault(d => d.ProductId == item.ProductId);

                if (detail != null)
                {
                    detail.Producing = item.Producing;
                    detail.Done = item.Done;
                    totalQuantity += item.Producing + item.Done;

                    var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == item.ProductId);
                    if (product != null)
                    {
                        product.ProductCode = item.ProductCode;
                        product.ProductName = item.ProductName;
                        _context.Products.Update(product);
                    }
                }
            }

            plan.Quantity = totalQuantity;
            _context.ProductionPlans.Update(plan);
            await _context.SaveChangesAsync();
        }

    }
}
