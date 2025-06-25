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

        public async Task<List<ProductionOrdersByPlanDto>> GetProductionOrdersByPlanIdAsync(int productionPlanId)
        {
            var productionOrders = await _context.ProductionOrders
                .Where(po => po.ProductionPlanId == productionPlanId)
                .ToListAsync();

            var result = new List<ProductionOrdersByPlanDto>();

            foreach (var po in productionOrders)
            {
                var outputs = await _context.ProductionOutputs
                    .Where(output => output.ProductionOrderId == po.Id)
                    .ToListAsync();

                var productCodes = new List<string>();
                foreach (var output in outputs)
                {
                    var glassTypes = await ExtractGlassTypesAsync(output.ProductId);
                    // Nối các glassTypes thành một chuỗi, nếu không có thì để chuỗi rỗng
                    var joined = string.Join(" ", glassTypes);
                    productCodes.Add(joined);
                }

                result.Add(new ProductionOrdersByPlanDto
                {
                    ProductionOrderCode = po.ProductionOrderCode,
                    OrderDate = po.OrderDate,
                    Description = po.Description,
                    ProductionStatus = po.ProductionStatus,
                    TotalAmount = (int)outputs.Sum(o => o.Amount ?? 0),
                    ProductCodes = productCodes
                });
            }

            return result;
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
                .Select(po => new ProductionOutputDto
                {
                    ProductId = po.ProductId,
                    ProductName = po.ProductName,
                    UOM = po.UOM,
                    Amount = po.Amount,
                    OrderId = po.OrderId,
                    CostObject = po.CostObject

                })
                .ToListAsync();

            return outputs;
        }

        public async Task<ProductionOrder> CreateProductionOrderAsync(ProductionOrderCreateRequest request)
        {
            var productionOrder = new ProductionOrder
            {
                ProductionOrderCode = $"PO-{DateTime.UtcNow.Ticks}",
                OrderDate = DateTime.UtcNow,
                Description = request.Description,
                ProductionStatus = "New",
                ProductionPlanId = request.ProductionPlanId
            };

            _context.ProductionOrders.Add(productionOrder);
            await _context.SaveChangesAsync();

            foreach (var item in request.Products)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product == null) continue;

                var output = new ProductionOutput
                {
                    ProductId = item.ProductId,
                    ProductName = product.ProductName,
                    UOM = product.UOM,
                    Amount = item.Quantity,
                    ProductionOrderId = productionOrder.Id
                };
                _context.ProductionOutputs.Add(output);
            }

            await _context.SaveChangesAsync();
            return productionOrder;
        }

        /// <summary>
        /// Lấy số lớp kính (GlassLayers) từ GlassStructure của sản phẩm theo productId.
        /// </summary>
        public async Task<int?> GetGlassLayersByProductIdAsync(int productId)
        {
            var product = await _context.Products
                .Include(p => p.GlassStructure)
                .FirstOrDefaultAsync(p => p.Id == productId);

            return product?.GlassStructure?.GlassLayers;
        }

        public async Task<List<string>> ExtractGlassTypesAsync(int productId)
        {
            var product = await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null || string.IsNullOrWhiteSpace(product.ProductName))
                return new List<string>();

            var results = new List<string>();
            var name = product.ProductName;

            // Regex để tìm EI## (ví dụ EI90, EI60)
            var eiMatch = Regex.Match(name, @"\bEI\d{2}\b", RegexOptions.IgnoreCase);
            if (eiMatch.Success)
            {
                results.Add(eiMatch.Value.ToUpper());
            }

            // Regex để tìm VNG-XXX (ví dụ VNG-N, VNG-MK, VNG-MB)
            var vngMatch = Regex.Match(name, @"\bVNG-[A-Z]+\b", RegexOptions.IgnoreCase);
            if (vngMatch.Success)
            {
                results.Add(vngMatch.Value.ToUpper());
            }

            return results;
        }

        public async Task<List<ProductionMaterial>> AddMaterialsByGlassTypeAsync(int productId, int productOutputId)
        {
            var glassTypes = await ExtractGlassTypesAsync(productId);

            // Kiểm tra điều kiện: có ít nhất 2 phần tử và phần tử thứ 2 là "VNG-N"
            if (glassTypes.Count >= 2 && glassTypes[1] == "VNG-N")
            {
                var materials = new List<ProductionMaterial>();

                // Tạo ProductionMaterial cho productId 23
                var material1 = new ProductionMaterial
                {
                    ProductionId = productId,
                    ProductionOutputId = productOutputId,
                    ProductionName = "Keo Trung tính màu đen (Silicone Sealant)",
                    UOM = "gói",
                    Product = await _context.Products.FindAsync(23)
                };
                materials.Add(material1);

                // Tạo ProductionMaterial cho productId 3
                var material2 = new ProductionMaterial
                {
                    ProductionId = productId,
                    ProductionOutputId = productOutputId,
                    ProductionName = "Keo Nano",
                    UOM = "kg",
                    Product = await _context.Products.FindAsync(3)
                };
                materials.Add(material2);

                // Thêm vào DbContext và lưu thay đổi
                _context.ProductionMaterials.AddRange(materials);
                await _context.SaveChangesAsync();

                return materials;
            }

            // Nếu không thỏa điều kiện, trả về list rỗng
            return new List<ProductionMaterial>();
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
