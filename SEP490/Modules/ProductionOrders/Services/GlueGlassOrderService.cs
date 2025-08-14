using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using System.Text.RegularExpressions;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class GlueGlassOrderService : BaseService, IGlueGlassOrderService
    {
        private readonly SEP490DbContext _context;

        public GlueGlassOrderService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateGlueGlassOrderAsync(GlueGlassOrderDto request)
        {
            try
            {
                using var transaction = await _context.Database.BeginTransactionAsync();

                // 1. Create Production Order
                var productionOrder = await CreateProductionOrderAsync(request);
                await _context.ProductionOrders.AddAsync(productionOrder);
                await _context.SaveChangesAsync();

                // 2. Process Finished Products and Create Production Outputs first
                var productIdMapping = await ProcessFinishedProductsAsync(request, productionOrder.Id);

                // 3. Create Production Order Details using finished product IDs
                await CreateProductionOrderDetailsAsync(request, productionOrder.Id, productIdMapping);

                // 4. Create Materials for each Production Output
                await CreateMaterialsForOutputsAsync(request, productionOrder.Id);

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                // Log exception here
                return false;
            }
        }

        private async Task<ProductionOrder> CreateProductionOrderAsync(GlueGlassOrderDto request)
        {
            // Create description from finished products
            var productNames = request.FinishedProducts.Select(fp => fp.ProductName);
            var description = "Lệnh ghép kính " + string.Join(", ", productNames);

            return new ProductionOrder
            {
                OrderDate = DateTime.Now,
                Type = "Ghép kính",
                Description = description,
                StatusDaNhapMisa = false,

                ProductionPlanId = request.ProductionPlanId
            };
        }

        private async Task<Dictionary<string, int>> ProcessFinishedProductsAsync(GlueGlassOrderDto request, int productionOrderId)
        {
            var productionOutputs = new List<ProductionOutput>();
            var productIdMapping = new Dictionary<string, int>(); // Maps finished product name to product ID

            foreach (var finishedProduct in request.FinishedProducts)
            {
                // Check if product exists in Product table
                var existingProduct = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductName == finishedProduct.ProductName);

                int productId;

                if (existingProduct == null)
                {
                    // Create new product
                    var newProduct = await CreateNewProductAsync(finishedProduct.ProductName);
                    await _context.Products.AddAsync(newProduct);
                    await _context.SaveChangesAsync();
                    productId = newProduct.Id;
                }
                else
                {
                    productId = existingProduct.Id;
                }

                // Store mapping for later use
                productIdMapping[finishedProduct.ProductName] = productId;

                // Create Production Output
                productionOutputs.Add(new ProductionOutput
                {
                    ProductId = productId,
                    ProductName = finishedProduct.ProductName,
                    //UOM = "tấm",
                    Amount = finishedProduct.Quantity,
                    ProductionOrderId = productionOrderId,
                    OutputFor = finishedProduct.OutputFor
                });
            }

            await _context.ProductionOutputs.AddRangeAsync(productionOutputs);
            await _context.SaveChangesAsync();

            return productIdMapping;
        }

        private async Task CreateProductionOrderDetailsAsync(GlueGlassOrderDto request, int productionOrderId, Dictionary<string, int> productIdMapping)
        {
            var orderDetails = new List<ProductionOrderDetail>();

            // Tạo ProductionOrderDetails cho các sản phẩm gốc cần ghép (từ ProductQuantities)
            foreach (var kvp in request.ProductQuantities)
            {
                // Chỉ tạo ProductionOrderDetail nếu quantity > 0
                if (kvp.Value > 0)
                {
                    // Lấy ProductId thực từ ProductionPlanDetail
                    var planDetail = await _context.ProductionPlanDetails
                        .FirstOrDefaultAsync(pd => pd.Id == kvp.Key);
                    
                    if (planDetail != null)
                    {
                        orderDetails.Add(new ProductionOrderDetail
                        {
                            ProductId = planDetail.ProductId, // Sử dụng ProductId thực từ bảng Product
                            Quantity = kvp.Value, // Số lượng sản phẩm gốc cần ghép
                            //TrangThai = null,
                            productionOrderId = productionOrderId
                        });
                    }
                }
            }

            await _context.ProductionOrderDetails.AddRangeAsync(orderDetails);
            await _context.SaveChangesAsync();
        }

        private async Task<Product> CreateNewProductAsync(string productName)
        {
            // Extract dimensions from product name (format: "Kính EI90 phút, KT: 700*400*30 mm, VNG-MK Cữ Kính nằm chưa đổ keo")
            var dimensionMatch = Regex.Match(productName, @"KT:\s*(\d+)\*(\d+)\*(\d+)");
            
            string? width = null;
            string? height = null;
            decimal? thickness = null;

            if (dimensionMatch.Success)
            {
                width = dimensionMatch.Groups[1].Value;
                height = dimensionMatch.Groups[2].Value;
                thickness = decimal.Parse(dimensionMatch.Groups[3].Value);
            }

            return new Product
            {
                ProductCode = null,
                ProductName = productName,
                ProductType = "Bán thành phẩm",
                UOM = "tấm",
                Width = width,
                Height = height,
                Thickness = thickness,
                Weight = null,
                UnitPrice = null,
                GlassStructureId = null
            };
        }

        private async Task CreateMaterialsForOutputsAsync(GlueGlassOrderDto request, int productionOrderId)
        {
            // Get all production outputs for this order
            var productionOutputs = await _context.ProductionOutputs
                .Where(po => po.ProductionOrderId == productionOrderId)
                .ToListAsync();

            var materials = new List<ProductionMaterial>();

            foreach (var output in productionOutputs)
            {
                if (output.OutputFor == null) continue;

                // Get the production plan detail to get material information
                var planDetail = await _context.ProductionPlanDetails
                    .Include(pd => pd.Product)
                    .FirstOrDefaultAsync(pd => pd.Id == output.OutputFor);

                if (planDetail == null || planDetail.Product == null) continue;

                // Get product dimensions
                var width = planDetail.Product.Width;
                var height = planDetail.Product.Height;
                var isCuongLuc = (planDetail.IsKinhCuongLuc ?? 0) == 1;
                var kinh4PerProduct = planDetail.Kinh4 ?? 0;
                var kinh5PerProduct = planDetail.Kinh5 ?? 0;
                var outputQuantity = output.Amount ?? 0;

                // Calculate material quantities
                var kinh4Quantity = kinh4PerProduct * outputQuantity;
                var kinh5Quantity = kinh5PerProduct * outputQuantity;
                var keoQuantity = 0.2m; // Default quantity for keo

                // Create materials based on whether it's tempered glass or not
                var glassPrefix = isCuongLuc ? "Kính cường lực tôi trắng KT:" : "Kính trắng KT:";
                var keoName = "Keo Trung tính màu đen (Silicone Sealant)";

                // Create or get glass 5mm material
                if (kinh5Quantity > 0)
                {
                    var glass5Name = $"{glassPrefix} {width}*{height}*5 mm";
                    var glass5Product = await GetOrCreateProductAsync(glass5Name);
                    materials.Add(new ProductionMaterial
                    {
                        //ProductionId = glass5Product.Id,
                        //ProductionName = glass5Name,
                        ProductionOutputId = output.Id,
                        //UOM = "tấm",
                        Amount = kinh5Quantity,
                        //CostObject = null,
                        //CostItem = null,
                        ProductId = glass5Product.Id
                    });
                }

                // Create or get glass 4mm material
                if (kinh4Quantity > 0)
                {
                    var glass4Name = $"{glassPrefix} {width}*{height}*4 mm";
                    var glass4Product = await GetOrCreateProductAsync(glass4Name);
                    materials.Add(new ProductionMaterial
                    {
                        //ProductionId = glass4Product.Id,
                        //ProductionName = glass4Name,
                        ProductionOutputId = output.Id,
                        //UOM = "tấm",
                        Amount = kinh4Quantity,
                        //CostObject = null,
                        //CostItem = null,
                        ProductId = glass4Product.Id
                    });
                }

                // Create or get keo material
                var keoProduct = await GetOrCreateProductAsync(keoName);
                materials.Add(new ProductionMaterial
                {
                    //ProductionId = keoProduct.Id,
                    //ProductionName = keoName,
                    ProductionOutputId = output.Id,
                    //UOM = "ml",
                    Amount = keoQuantity,
                    //CostObject = null,
                    //CostItem = null,
                    ProductId = keoProduct.Id
                });
            }

            await _context.ProductionMaterials.AddRangeAsync(materials);
            await _context.SaveChangesAsync();
        }

        private async Task<Product> GetOrCreateProductAsync(string productName)
        {
            // Check if product already exists
            var existingProduct = await _context.Products
                .FirstOrDefaultAsync(p => p.ProductName == productName);

            if (existingProduct != null)
            {
                return existingProduct;
            }

            // Create new product
            var newProduct = new Product
            {
                ProductCode = null,
                ProductName = productName,
                ProductType = "NVL",
                UOM = productName.Contains("Keo") ? "kg" : "tấm",
                Width = null,
                Height = null,
                Thickness = null,
                Weight = null,
                UnitPrice = null,
                GlassStructureId = null,
                isupdatemisa = false
            };

            await _context.Products.AddAsync(newProduct);
            await _context.SaveChangesAsync();

            return newProduct;
        }
    }
} 