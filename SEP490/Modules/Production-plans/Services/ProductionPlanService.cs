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

        /// <summary>
        /// Lấy số lượng sản phẩm đang sản xuất (Producing) theo ProductionPlanId và ProductId.
        /// </summary>
        /// <param name="productionPlanId">Id của kế hoạch sản xuất.</param>
        /// <param name="productId">Id của sản phẩm.</param>
        /// <returns>
        /// Số lượng sản phẩm đang sản xuất (Producing) nếu tìm thấy, ngược lại trả về null.
        /// </returns>
        public async Task<int?> GetProducingQuantityAsync(int productionPlanId, int productId)
        {
            var detail = await _context.ProductionPlanDetails
                .FirstOrDefaultAsync(ppd =>
                    ppd.ProductionPlanId == productionPlanId &&
                    ppd.ProductId == productId);

            return detail?.Producing;
        }

        /// <summary>
        /// Lấy số lượng sản phẩm đã hoàn thành (Done) theo ProductionPlanId và ProductId.
        /// </summary>
        /// <param name="productionPlanId">Id của kế hoạch sản xuất.</param>
        /// <param name="productId">Id của sản phẩm.</param>
        /// <returns>
        /// Số lượng sản phẩm đã hoàn thành (Done) nếu tìm thấy, ngược lại trả về null.
        /// </returns>
        public async Task<int?> GetDoneAsync(int productionPlanId, int productId)
        {
            var detail = await _context.ProductionPlanDetails
                .FirstOrDefaultAsync(x => x.ProductionPlanId == productionPlanId && x.ProductId == productId);

            return detail?.Done;
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
                    //OrderCode = p.OrderCode,                           // Mã ĐH
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
        //public async Task<List<CreateProductionPlanDTO >> CreateProductionPlansAsync(int orderId)
        //{


        //    var result = await _context.ProductionPlanDetails          
        //        .Include(p => p.ProductionPlan)
        //            .ThenInclude(d=> d.Customer)
        //            .ThenInclude(e=>e.SaleOrders)
        //        .Include(p => p.Product)
        //        .Where(p => p.ProductionPlan.SaleOrderId == orderId)
        //        .Select(p => new CreateProductionPlanDTO
        //        {
        //            Id= p.Id,
        //            Status = p.ProductionPlan.Status,
        //            PlanDate = p.ProductionPlan.PlanDate.ToString("dd/MM/yyyy"),
        //            OrderCode = p.ProductionPlan.SaleOrderId.ToString(),
        //            CustomerName = p.ProductionPlan.Customer.CustomerName,
        //            Quantity = p.ProductionPlan.Quantity,
        //            ProductCode = p.Product.ProductCode,
        //            Thickness = p.Product.Thickness,
        //            Width = p.Product.Width,
        //            Height = p.Product.Height,
        //            InProgressQuantity = p.Producing,
        //            Completed = p.Done,
        //        })
        //        .ToListAsync();

        //    return result;
        //}
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
                //OrderCode = dto.OrderCode,
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


    }
}
