using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class MaterialsService : BaseService, IMaterialsService
    {
        private readonly SEP490DbContext _context;

        public MaterialsService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<decimal> CalculateButylLength(int productId)
        {
            var product = await _context.Products
                .Include(p => p.GlassStructure)
                .FirstOrDefaultAsync(p => p.Id == productId);

            if (product == null)
                throw new ArgumentException("Product not found", nameof(productId));

            decimal width = 0, height = 0;
            decimal.TryParse(product.Width, out width);
            decimal.TryParse(product.Height, out height);

            // Calculate perimeter (circumference) in meters
            decimal perimeter = (width + height) * 2 / 1000;

            // Get number of adhesive layers from glass structure
            int adhesiveLayers = product.GlassStructure?.AdhesiveLayers ?? 1;

            // Calculate total butyl length (perimeter * number of adhesive layers)
            return perimeter * adhesiveLayers;
        }

        public async Task<int?> GetButylProductIdByGlassProduct(int glassProductId)
        {
            // Get glass product with GlassStructure
            var glassProduct = await _context.Products
                .Include(p => p.GlassStructure)
                .FirstOrDefaultAsync(p => p.Id == glassProductId && p.ProductType == "Thành phẩm");

            if (glassProduct == null)
                throw new ArgumentException("Glass product not found", nameof(glassProductId));

            // Get glass thickness
            decimal glassThickness = glassProduct.Thickness ?? 0;

            // Get number of glass layers and adhesive layers
            int glassLayers = glassProduct.GlassStructure?.GlassLayers ?? 2;
            int adhesiveLayers = glassProduct.GlassStructure?.AdhesiveLayers ?? 1;

            // Subtract value based on glass layers
            int subtractValue = glassLayers switch
            {
                2 => 10,
                3 => 14,
                4 => 18,
                5 => 22,
                _ => 10 // default to 10 if out of range
            };

            // Calculate butyl thickness
            decimal butylThickness = (glassThickness - subtractValue) / adhesiveLayers;

            // Find butyl product with matching thickness 
            var butylProduct = await _context.Products
                .Where(p => p.ProductType == "Butyl" && p.Thickness != null)
                .FirstOrDefaultAsync(p => Math.Round(p.Thickness.Value, 2) == Math.Round(butylThickness, 2));

            return butylProduct?.Id;
        }

        public async Task<decimal> CalculateAdhesiveAmount(int glassProductId)
        {
            var product = await _context.Products
                .Include(p => p.GlassStructure)
                .FirstOrDefaultAsync(p => p.Id == glassProductId && p.ProductType == "Thành phẩm");

            if (product == null)
                throw new ArgumentException("Glass product not found", nameof(glassProductId));

            decimal width = 0, height = 0, thickness = 0;
            decimal.TryParse(product.Width, out width);
            decimal.TryParse(product.Height, out height);
            thickness = product.Thickness ?? 0;

            int glassLayers = product.GlassStructure?.GlassLayers ?? 2;

            int subtractValue = glassLayers switch
            {
                2 => 10,
                3 => 14,
                4 => 18,
                5 => 22,
                _ => 10
            };

            decimal area = (height - 20) * (width - 20) / 1_000_000m;
            decimal adhesiveAmount = area * (thickness - subtractValue) * 1.2m;

            return adhesiveAmount;
        }

        public async Task<string> GetGlassDescription(int glassProductId, int thickness)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == glassProductId && p.ProductType == "Thành phẩm");

            if (product == null)
                throw new ArgumentException("Glass product not found", nameof(glassProductId));

            decimal width = 0, height = 0;
            decimal.TryParse(product.Width, out width);
            decimal.TryParse(product.Height, out height);

            return $"Kính trắng {thickness} ly, KT:{height}*{width}*{thickness} mm";
        }

        public async Task<List<ProductionMaterial>> AddMaterialsForProductAsync(int glassProductId, int productionOutputId)
        {
            var materials = new List<ProductionMaterial>();

            // Get glass product with GlassStructure
            var glassProduct = await _context.Products
                .Include(p => p.GlassStructure)
                .FirstOrDefaultAsync(p => p.Id == glassProductId && p.ProductType == "Thành phẩm");

            if (glassProduct == null)
                throw new ArgumentException("Glass product not found", nameof(glassProductId));

            // Determine keo product id based on category
            int keoProductId = (glassProduct.GlassStructure?.Category == "VNG-N") ? 3 : 2;

            var keoProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == keoProductId);
            if (keoProduct != null)
            {
                var keoAmount = await CalculateAdhesiveAmount(glassProductId);
                materials.Add(new ProductionMaterial
                {
                    ProductionId = keoProductId,
                    ProductionOutputId = productionOutputId,
                    ProductionName = keoProduct.ProductName,
                    Product = glassProduct,
                    UOM = keoProduct.UOM,
                    Amount = keoAmount
                });
            }

            // Always add productCode 23 (silicon) with amount = null
            var siliconProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == 23);
            if (siliconProduct != null)
            {
                materials.Add(new ProductionMaterial
                {
                    ProductionId = siliconProduct.Id,
                    ProductionOutputId = productionOutputId,
                    ProductionName = siliconProduct.ProductName,
                    Product = glassProduct,
                    UOM = siliconProduct.UOM,
                    Amount = null
                });
            }

            // Add butyl product (amount = null)
            var butylProductId = await GetButylProductIdByGlassProduct(glassProductId);
            if (butylProductId.HasValue)
            {
                var butylProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == butylProductId.Value);
                if (butylProduct != null)
                {
                    var butylLength = await CalculateButylLength(glassProductId);
                    materials.Add(new ProductionMaterial
                    {
                        ProductionId = butylProduct.Id,
                        ProductionOutputId = productionOutputId,
                        ProductionName = butylProduct.ProductName,
                        Product = glassProduct,
                        UOM = butylProduct.UOM,
                        Amount = butylLength
                    });
                }
            }

            // Add to DbContext and save
            _context.Set<ProductionMaterial>().AddRange(materials);
            await _context.SaveChangesAsync();

            return materials;
        }

        public async Task<List<ProductionMaterial>> GetMaterialsByProductIdAsync(int productId, int productionOutputId)
        {
            return await _context.Set<ProductionMaterial>()
                .Where(m => m.Product.Id == productId && m.ProductionOutputId == productionOutputId)
                .Include(m => m.Product)
                .ToListAsync();
        }
    }
}
