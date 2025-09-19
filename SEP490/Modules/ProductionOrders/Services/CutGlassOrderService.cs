using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using System.Text.RegularExpressions;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class CutGlassOrderService : BaseTransientService, ICutGlassOrderService
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
                // Validate input data
                await ValidateCutGlassOrderRequestAsync(request);

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // 1. Create Production Order
                    var productionOrder = await CreateProductionOrderAsync(request);
                    await _context.ProductionOrders.AddAsync(productionOrder);
                    await _context.SaveChangesAsync();

                    // 2. Process Finished Products and Create Production Outputs first
                    var productIdMapping = await ProcessFinishedProductsAsync(request, productionOrder.Id);



                    await transaction.CommitAsync();
                    return true;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        private async Task ValidateCutGlassOrderRequestAsync(CutGlassOrderDto request)
        {
            // Validate ProductionPlanId
            if (request.ProductionPlanId <= 0)
            {
                throw new ArgumentException("ID kế hoạch sản xuất không hợp lệ");
            }

            // Check if production plan exists
            var productionPlan = await _context.ProductionPlans
                .FirstOrDefaultAsync(pp => pp.Id == request.ProductionPlanId);
            if (productionPlan == null)
            {
                throw new ArgumentException("Kế hoạch sản xuất không tồn tại");
            }

            // Validate ProductQuantities
            if (request.ProductQuantities == null || !request.ProductQuantities.Any())
            {
                throw new ArgumentException("Vui lòng chọn ít nhất một sản phẩm cần cắt");
            }

            // Validate each product quantity
            foreach (var kvp in request.ProductQuantities)
            {
                if (kvp.Value <= 0)
                {
                    throw new ArgumentException("Số lượng sản phẩm phải lớn hơn 0");
                }

                // Check if production plan detail exists
                var planDetail = await _context.ProductionPlanDetails
                    .FirstOrDefaultAsync(pd => pd.Id == kvp.Key);
                if (planDetail == null)
                {
                    throw new ArgumentException($"Chi tiết kế hoạch sản xuất ID {kvp.Key} không tồn tại");
                }
            }

            // Validate FinishedProducts
            if (request.FinishedProducts == null || !request.FinishedProducts.Any())
            {
                throw new ArgumentException("Vui lòng thêm ít nhất một thành phẩm");
            }

            foreach (var finishedProduct in request.FinishedProducts)
            {
                if (string.IsNullOrWhiteSpace(finishedProduct.ProductName))
                {
                    throw new ArgumentException("Tên thành phẩm không được để trống");
                }

                if (finishedProduct.Quantity <= 0)
                {
                    throw new ArgumentException($"Số lượng thành phẩm '{finishedProduct.ProductName}' phải lớn hơn 0");
                }
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
                    // Create new product with more flexible logic
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
                    Amount = finishedProduct.Quantity,
                    ProductionOrderId = productionOrderId
                });
            }

            await _context.ProductionOutputs.AddRangeAsync(productionOutputs);
            await _context.SaveChangesAsync();

            return productIdMapping;
        }



        private async Task<Product> CreateNewProductAsync(string productName)
        {
            // More flexible dimension extraction
            var dimensionPatterns = new[]
            {
                @"KT:\s*(\d+)\*(\d+)\*(\d+)", // KT: 700*400*5
                @"(\d+)\*(\d+)\*(\d+)",       // 700*400*5
                @"(\d+)\s*x\s*(\d+)\s*x\s*(\d+)", // 700 x 400 x 5
                @"(\d+)\s*×\s*(\d+)\s*×\s*(\d+)"  // 700 × 400 × 5
            };

            string? width = null;
            string? height = null;
            decimal? thickness = null;

            foreach (var pattern in dimensionPatterns)
            {
                var match = Regex.Match(productName, pattern);
                if (match.Success)
                {
                    width = match.Groups[1].Value;
                    height = match.Groups[2].Value;
                    thickness = decimal.Parse(match.Groups[3].Value);
                    break;
                }
            }

            // Determine product type based on name
            string productType = "NVL"; // Default
            if (productName.Contains("kính", StringComparison.OrdinalIgnoreCase) || 
                productName.Contains("glass", StringComparison.OrdinalIgnoreCase))
            {
                productType = "NVL";
            }

            return new Product
            {
                ProductCode = GenerateProductCode(productName),
                ProductName = productName,
                ProductType = productType,
                UOM = "Tấm",
                Width = width,
                Height = height,
                Thickness = thickness,
                Weight = null,
                UnitPrice = null,
                GlassStructureId = null,
                isupdatemisa = 0
            };
        }

        private string GenerateProductCode(string productName)
        {
            // Generate a simple product code based on name and timestamp
            var timestamp = DateTime.Now.ToString("yyyyMMddHHmmss");
            var namePart = productName.Replace(" ", "").Replace("*", "").Replace(":", "");
            return $"KT_{namePart}_{timestamp}";
        }
    }
} 