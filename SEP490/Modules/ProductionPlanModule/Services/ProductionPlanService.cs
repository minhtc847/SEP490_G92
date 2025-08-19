using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Production_plans.DTO;

namespace SEP490.Modules.Production_plans.Services
{
    public class ProductionPlanService : BaseScopedService, IProductionPlanService
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
                    OrderCode = p.SaleOrder.OrderCode,
                    OrderId = p.SaleOrder.Id,
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
                OrderCode = plan.SaleOrder.OrderCode,
                OrderDate = plan.SaleOrder.OrderDate,
                PlanDate = plan.PlanDate,
                Status = plan.Status,
                Quantity = plan.ProductionPlanDetails.Sum(x => x.Quantity),
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
                    Completed = pd.Done,
                    DaGiao = pd.DaGiao ?? 0
                })
                .ToListAsync();

            return productDetails;
        }

        public async Task<ProductionPlanDetailViewDTO> CreateProductionPlanFromSaleOrderAsync(CreateProductionPlanFromSaleOrderDTO dto)
        {
            var saleOrder = await _context.SaleOrders
                .Include(so => so.Customer)
                .Include(so => so.OrderDetails)
                    .ThenInclude(od => od.OrderDetailProducts)
                        .ThenInclude(odp => odp.Product)
                            .ThenInclude(p => p.GlassStructure)
                .FirstOrDefaultAsync(so => so.Id == dto.SaleOrderId);

            if (saleOrder == null)
                throw new Exception("Sale order not found");

            var plan = new ProductionPlan
            {
                SaleOrderId = saleOrder.Id,
                Customer = saleOrder.Customer,
                PlanDate = DateTime.Now,
                Status = "Đang sản xuất",
                
            };
            _context.ProductionPlans.Add(plan);
            await _context.SaveChangesAsync();

            decimal totalKeoNano = 0;
            decimal totalKeoMem = 0;

            foreach (var prod in dto.Products)
            {
                var product = await _context.Products
                    .Include(p => p.GlassStructure)
                    .FirstOrDefaultAsync(p => p.Id == prod.ProductId);

                if (product == null || product.GlassStructure == null)
                    throw new Exception("Product or GlassStructure not found");

                int glass5mm = 2;
                int glass4mm = (product.GlassStructure.GlassLayers ?? 0) - 2;
                if (glass4mm < 0) glass4mm = 0;
                int butylType = (int)(product.GlassStructure.AdhesiveThickness ?? 0);

                // Parse width and height from string to decimal
                if (!decimal.TryParse(product.Width, out decimal width) || !decimal.TryParse(product.Height, out decimal height))
                {
                    throw new Exception($"Invalid width or height for product {product.ProductName}");
                }

                decimal areaKeo = ((width - 20) * (height - 20)) / 1_000_000M;
                decimal doDayKeo = prod.Thickness - (glass4mm * 4) - (glass5mm * 5);
                decimal tongKeo = areaKeo * doDayKeo * 1.2M;

                // Debug logging
                Console.WriteLine($"Product: {product.ProductName}, Width: {width}, Height: {height}, Thickness: {prod.Thickness}");
                Console.WriteLine($"Glass4mm: {glass4mm}, Glass5mm: {glass5mm}, AreaKeo: {areaKeo}, DoDayKeo: {doDayKeo}, TongKeo: {tongKeo}");
                Console.WriteLine($"AdhesiveType: {product.GlassStructure.AdhesiveType}");

                // Tính độ dài butyl = (dài + rộng) * 2 * số lớp keo (chuyển từ mm sang m)
                decimal doDaiButyl = ((width + height) * 2 * prod.GlueLayers) / 1000M;

                if ((product.GlassStructure.AdhesiveType ?? "").ToLower() == "nano")
                    totalKeoNano += tongKeo;
                else if ((product.GlassStructure.AdhesiveType ?? "").ToLower() == "mềm")
                    totalKeoMem += tongKeo;

                var planDetail = new ProductionPlanDetail
                {
                    ProductionPlanId = plan.Id,
                    ProductId = product.Id,
                    Quantity = prod.Quantity,
                    Doday = prod.Thickness,
                    SoLopKeo = prod.GlueLayers,
                    SoLopKinh = prod.GlassLayers,
                    UOM = UOM.Tấm,
                    Kinh4 = glass4mm,
                    Kinh5 = glass5mm,
                    LoaiButyl = butylType,
                    IsKinhCuongLuc = prod.IsCuongLuc ? 1 : 0,
                    TongKeoNano = (product.GlassStructure.AdhesiveType ?? "").ToLower() == "nano" ? tongKeo * prod.Quantity : 0,
                    TongKeoMem = (product.GlassStructure.AdhesiveType ?? "").ToLower() == "mềm" ? tongKeo * prod.Quantity : 0,
                    DoDaiButyl = doDaiButyl
                };
                _context.ProductionPlanDetails.Add(planDetail);
            }

            await _context.SaveChangesAsync();

            return new ProductionPlanDetailViewDTO
            {
                CustomerName = saleOrder.Customer.CustomerName ?? "",
                Address = saleOrder.Customer.Address,
                Phone = saleOrder.Customer.Phone,
                OrderCode = saleOrder.OrderCode ?? "",
                OrderDate = saleOrder.OrderDate,
                DeliveryStatus = saleOrder.DeliveryStatus,
                PlanDate = plan.PlanDate,
                Status = plan.Status,
                Done = 0
            };
        }

        public async Task<ProductionPlanMaterialDetailDTO> GetProductionPlanMaterialDetailAsync(int id)
        {
            var planDetails = await _context.ProductionPlanDetails
                .Include(pd => pd.Product)
                    .ThenInclude(p => p.GlassStructure)
                .Where(pd => pd.ProductionPlanId == id)
                .ToListAsync();

            var dto = new ProductionPlanMaterialDetailDTO();
            // TODO: Tính toán các trường tổng vật tư dựa trên dữ liệu planDetails và Product
            // Demo mẫu:
            dto.TotalKeoNano = planDetails.Sum(x => (decimal?)x.TongKeoNano ?? 0);
            dto.ChatA = 10; // Tính toán thực tế tuỳ vào công thức
            dto.KOH = 2;
            dto.H2O = 8;
            dto.TotalKeoMem = planDetails.Sum(x => (decimal?)x.TongKeoMem ?? 0);
            dto.NuocLieu = 10;
            dto.A = 7;
            dto.B = 3;
            dto.Products = planDetails.Select(pd => new ProductionPlanMaterialProductDTO
            {
                Id = pd.Id,
                ProductName = pd.Product.ProductName ?? string.Empty,
                ProductCode = pd.Product.ProductCode,
                Width = pd.Product.Width ?? "0",
                Height = pd.Product.Height ?? "0",
                Quantity = pd.Quantity,
                Thickness = pd.Doday ?? 0,
                GlueLayers = pd.SoLopKeo ?? 0,
                GlassLayers = pd.SoLopKinh ?? 0,
                Glass4mm = pd.Kinh4 ?? 0,
                Glass5mm = pd.Kinh5 ?? 0,
                ButylType = pd.LoaiButyl ?? 0,
                TotalGlue = (pd.TongKeoNano ?? 0) + (pd.TongKeoMem ?? 0),
                ButylLength = pd.DoDaiButyl ?? 0,
                IsCuongLuc = (pd.IsKinhCuongLuc ?? 0) == 1,
                AdhesiveType = pd.Product.GlassStructure?.AdhesiveType ?? string.Empty
            }).ToList();
            return dto;
        }

        public async Task<List<ProductionPlanOutputDto>> GetProductionPlanOutputsAsync(int productionPlanId)
        {
            var outputs = await _context.ProductionOutputs
                .Where(o => o.ProductionOrder.ProductionPlanId == productionPlanId)
                .ToListAsync();

            var grouped = outputs
                .GroupBy(o => o.ProductId)
                .Select(g => new ProductionPlanOutputDto
                {
                    OutputId = g.Min(o => o.Id),
                    ProductId = g.Key,
                    ProductName = g.FirstOrDefault()?.ProductName,
                    TotalAmount = g.Sum(o => o.Amount ?? 0),
                    Done = g.Sum(o => o.Finished ?? 0),
                    Broken = g.Sum(o => o.Defected ?? 0)
                })
                .ToList();

            return grouped;
        }

        public async Task<bool> DeleteProductionPlanAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Get all production orders for this plan
                var productionOrders = await _context.ProductionOrders.Where(po => po.ProductionPlanId == id).ToListAsync();
                var productionOrderIds = productionOrders.Select(po => po.Id).ToList();

                // Get all outputs for these orders
                var outputs = await _context.ProductionOutputs.Where(o => o.ProductionOrderId != null && productionOrderIds.Contains(o.ProductionOrderId.Value)).ToListAsync();
                var outputIds = outputs.Select(o => o.Id).ToList();

                // Delete all materials for these outputs
                var materials = await _context.ProductionMaterials.Where(m => outputIds.Contains(m.ProductionOutputId)).ToListAsync();
                _context.ProductionMaterials.RemoveRange(materials);

                // Delete all outputs
                _context.ProductionOutputs.RemoveRange(outputs);

                // Delete all production order details
                var orderDetails = await _context.ProductionOrderDetails.Where(d => productionOrderIds.Contains(d.productionOrderId)).ToListAsync();
                _context.ProductionOrderDetails.RemoveRange(orderDetails);

                // Delete all production orders
                _context.ProductionOrders.RemoveRange(productionOrders);

                // Delete all plan details
                var planDetails = await _context.ProductionPlanDetails.Where(pd => pd.ProductionPlanId == id).ToListAsync();
                _context.ProductionPlanDetails.RemoveRange(planDetails);

                // Delete the plan
                var plan = await _context.ProductionPlans.FindAsync(id);
                if (plan != null)
                {
                    _context.ProductionPlans.Remove(plan);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                return false;
            }
        }

        public async Task<bool> HasProductionPlanAsync(int saleOrderId)
        {
            var productionPlan = await _context.ProductionPlans
                .FirstOrDefaultAsync(p => p.SaleOrderId == saleOrderId);
            
            return productionPlan != null;
        }
    }
}
