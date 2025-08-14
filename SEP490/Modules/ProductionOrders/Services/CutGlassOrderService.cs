using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using System.Text.RegularExpressions;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class CutGlassOrderService : BaseService, ICutGlassOrderService
    {
        private readonly SEP490DbContext _context;

        public CutGlassOrderService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateCutGlassOrderAsync(CutGlassOrderDto request)
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

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                // Log exception here
                return false;
            }
        }

        private async Task<ProductionOrder> CreateProductionOrderAsync(CutGlassOrderDto request)
        {
            // Create description from finished products
            var productNames = request.FinishedProducts.Select(fp => fp.ProductName);
            var description = "Lệnh cắt kính " + string.Join(", ", productNames);

            return new ProductionOrder
            {
                OrderDate = DateTime.Now,
                Type = "Cắt kính",
                Description = description,
                StatusDaNhapMisa = false,

                ProductionPlanId = request.ProductionPlanId
            };
        }

        private async Task<Dictionary<string, int>> ProcessFinishedProductsAsync(CutGlassOrderDto request, int productionOrderId)
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

                });
            }

            await _context.ProductionOutputs.AddRangeAsync(productionOutputs);
            await _context.SaveChangesAsync();

            return productIdMapping;
        }

        private async Task CreateProductionOrderDetailsAsync(CutGlassOrderDto request, int productionOrderId, Dictionary<string, int> productIdMapping)
        {
            var orderDetails = new List<ProductionOrderDetail>();

            // Tạo ProductionOrderDetails cho các sản phẩm gốc cần cắt (từ ProductQuantities)
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
                            Quantity = kvp.Value, // Số lượng sản phẩm gốc cần cắt
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
            // Extract dimensions from product name (format: "Kính trắng KT: 700*400*5 mm")
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
                ProductType = "NVL",
                UOM = "tấm",
                Width = width,
                Height = height,
                Thickness = thickness,
                Weight = null,
                UnitPrice = null,
                GlassStructureId = null,
                isupdatemisa = false
            };
        }
    }
} 