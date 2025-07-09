using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Modules.ProductionOrders.Services;
using System.Text.RegularExpressions;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class ProductionOrdersService : BaseService, IProductionOrdersService
    {
        private readonly SEP490DbContext _context;
        public ProductionOrdersService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductionOutputDto>> CreateProductionOutputsFromOrderAsync(int productionOrderId)
        {
            var order = await _context.ProductionOrders
                .Include(po => po.ProductionPlan)
                .FirstOrDefaultAsync(po => po.Id == productionOrderId);

            if (order == null)
                throw new ArgumentException("ProductionOrder not found", nameof(productionOrderId));

            // Get all products from ProductionPlanDetail for this plan
            var planDetails = await _context.ProductionPlanDetails
                .Where(d => d.ProductionPlanId == order.ProductionPlanId)
                .ToListAsync();

            var outputs = new List<ProductionOutputDto>();

            foreach (var detail in planDetails)
            {
                // Check if output already exists for this product and order
                var exists = await _context.ProductionOutputs
                    .AnyAsync(po => po.ProductionOrderId == productionOrderId && po.ProductId == detail.ProductId);

                if (!exists)
                {
                    var output = new ProductionOutput
                    {
                        ProductionOrderId = productionOrderId,
                        ProductId = detail.ProductId,
                        ProductName = detail.Product?.ProductName,
                        UOM = detail.Product?.UOM,
                        Amount = detail.Producing + detail.Done,
                        OrderId = order.Id,
                        CostObject = null // Set as needed
                    };
                    _context.ProductionOutputs.Add(output);

                    outputs.Add(new ProductionOutputDto
                    {
                        ProductId = output.ProductId,
                        ProductName = output.ProductName,
                        ProductCode = output.Product?.ProductCode,
                        UOM = output.UOM,
                        Amount = output.Amount,
                        OrderId = output.OrderId,
                        CostObject = output.CostObject
                    });
                }
            }

            await _context.SaveChangesAsync();
            return outputs;
        }

        public async Task<ProductionOrder?> CreateProductionOrderAsync(int planId)
        {
            var plan = await _context.ProductionPlans.FindAsync(planId);
            if (plan == null) return null;

            var newOrder = new ProductionOrder
            {
                ProductionPlanId = planId,
                OrderDate = DateTime.Now,
                ProductionOrderCode = $"LSX-{planId}",
                Description = $"Lệnh sản xuất hàng ... ",
                ProductionStatus = "Đang thực hiện"
                // Set other properties as needed
            };

            _context.ProductionOrders.Add(newOrder);
            await _context.SaveChangesAsync();
            return newOrder;
        }

        public async Task<List<ProductionOrdersByPlanDto>> GetProductionOrdersByPlanIdAsync(int productionPlanId)
        {
            var productionOrders = await _context.ProductionOrders
                .Where(po => po.ProductionPlanId == productionPlanId)
                .Select(po => new ProductionOrdersByPlanDto
                {
                    ProductionOrderId = po.Id,
                    OrderDate = po.OrderDate,
                    Type = po.Type,
                    Description = po.Description,
                    StatusDaXuatKhoNVL = po.StatusDaXuatKhoNVL,
                    StatusDaNhapKhoTP = po.StatusDaNhapKhoTP,
                })
                .ToListAsync();

            return productionOrders;
        }

        public async Task<ProductionOrder?> GetProductionOrderByIdAsync(int productionOrderId)
        {
            return await _context.ProductionOrders
                .Include(po => po.ProductionPlan)
                .FirstOrDefaultAsync(po => po.Id == productionOrderId);
        }

        public async Task<List<ProductionOutputDto>> GetProductionOutputsAsync(int productionOrderId)
        {
            var outputs = await _context.ProductionOutputs
                .Where(po => po.ProductionOrderId == productionOrderId)
                .Include(po => po.ProductionOrder)
                    .ThenInclude(order => order.ProductionPlan)
                .Select(po => new ProductionOutputDto
                {
                    ProductionOutputId = po.Id, // Map the Id here
                    ProductId = po.ProductId,
                    ProductName = po.ProductName,
                    ProductCode = po.Product.ProductCode,
                    UOM = po.UOM,
                    Amount = po.Amount,
                    //OrderId = po.ProductionOrder.ProductionPlan.SaleOrderId,
                    CostObject = po.CostObject
                })
                .ToListAsync();

            return outputs;
        }


        public List<ProductionOrderListDto> GetAll()
        {
            return _context.ProductionOrders
                .Include(po => po.ProductionPlan)
                    .ThenInclude(pp => pp.Customer)
                .Include(po => po.ProductionPlan)
                    .ThenInclude(pp => pp.SaleOrder)
                .Select(po => new ProductionOrderListDto
                {
                    ProductionOrderId = po.Id,
                    ProductionOrderCode = po.ProductionOrderCode,
                    OrderCode = po.ProductionPlan.SaleOrder.OrderCode,
                    CustomerName = po.ProductionPlan.Customer.CustomerName,
                    TotalAmount = _context.ProductionOutputs
                        .Where(poOut => poOut.ProductionOrderId == po.Id)
                        .Sum(poOut => (int?)poOut.Amount ?? 0)
                })
                .ToList();
        }
        public List<ProductionOrderDetailDto> GetDetailsByProductionOrderId(int productionOrderId)
        {
            var query = from po in _context.ProductionOrders
                        where po.Id == productionOrderId
                        join pout in _context.ProductionOutputs on po.Id equals pout.ProductionOrderId
                        join prod in _context.Products on pout.ProductId equals prod.Id
                        join gs in _context.GlassStructures on prod.GlassStructureId equals gs.Id
                        select new { po, pout, prod, gs };

            var result = query.ToList().Select(x => new ProductionOrderDetailDto
            {
                ProductionOrderId = x.po.Id,
                ProductionOrderCode = x.prod.ProductCode,
                ProductName = x.prod.ProductName,
                ProductId = x.prod.Id,
                AdhesiveLayers = x.gs.AdhesiveLayers,
                GlassLayers = x.gs.GlassLayers,
                Thickness = x.prod.Thickness,
                Width = x.prod.Width,
                Height = x.prod.Height,
                ButylThickness = (x.gs.EdgeType != null && x.gs.EdgeType.ToLower() == "butyl") ? (x.gs.AdhesiveThickness ?? 0) : 0,
                Quantity = x.pout.Amount ?? 0
            }).ToList();
            return result;
        }
        public ProductCalculationDto CalculateProduct(int productionOrderId, int productId)
        {
            var query = from po in _context.ProductionOrders
                        where po.Id == productionOrderId
                        join pout in _context.ProductionOutputs on po.Id equals pout.ProductionOrderId
                        where pout.ProductId == productId
                        join prod in _context.Products on pout.ProductId equals prod.Id
                        join gs in _context.GlassStructures on prod.GlassStructureId equals gs.Id
                        select new { po, pout, prod, gs };

            var result = query.FirstOrDefault();
            if (result == null)
                return new ProductCalculationDto();

            decimal width = 0, height = 0;
            decimal.TryParse(result.prod.Width, out width);
            decimal.TryParse(result.prod.Height, out height);

            decimal glassArea = width * height * (result.gs.GlassLayers ?? 0) / 1000000; 
            decimal perimeter = (width + height) * 2 /1000; 
            
            const decimal z = 20; // hằng số độ dày keo butyl
            decimal adhesiveArea = (width - z) * (height - z) / 1000000;


            const decimal n = 1.2m; // mật độ chất để chuyển đổi từ thể tích sang khối lượng
            decimal SCH = result.prod.Thickness ?? 0; // Độ dày thành phẩm (tổng độ dày)
            decimal sch = 2 * 5 + ((result.gs.GlassLayers ?? 2) - 2) * 4; // Độ dày phôi kính: 2 lớp ngoài 5mm + các lớp trong 4mm
            decimal p = result.gs.AdhesiveLayers ?? 1; 
            decimal glassLayersCount = result.gs.GlassLayers ?? 1;
            decimal adhesivePerLayer = adhesiveArea * (SCH - sch) * n / p;

            decimal N = result.pout.Amount ?? 0; // Số lượng kính thành phẩm
            decimal totalAdhesive = adhesivePerLayer * p * N;

            decimal substanceA = totalAdhesive * (1000m / (1000m + 335m));
            decimal mKOH = (totalAdhesive - substanceA) * 0.45m; 
            decimal mH2O = (totalAdhesive - substanceA) * 0.55m;


            return new ProductCalculationDto
            {
                GlassArea = Math.Round(glassArea, 4),
                Perimeter = Math.Round(perimeter, 2),
                AdhesiveArea = Math.Round(adhesiveArea, 4),
                AdhesivePerLayer = Math.Round(adhesivePerLayer, 4),
                TotalAdhesive = Math.Round(totalAdhesive, 2),
                ButylLength = Math.Round(perimeter, 4),
                SubstanceA = Math.Round(substanceA, 4),
                KOH = Math.Round(mKOH, 4),
                H2O = Math.Round(mH2O, 4),
            };
        }
    }
}
