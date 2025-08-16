using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class PourGlueOrderService : BaseTransientService, IPourGlueOrderService
    {
        private readonly SEP490DbContext _context;

        public PourGlueOrderService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreatePourGlueOrderAsync(PourGlueOrderDto request)
        {
            try
            {
                using var transaction = await _context.Database.BeginTransactionAsync();

                // 1. Create Production Order
                var productionOrder = await CreateProductionOrderAsync(request);
                await _context.ProductionOrders.AddAsync(productionOrder);
                await _context.SaveChangesAsync();

                // 2. Create Production Outputs
                await CreateProductionOutputsAsync(request, productionOrder.Id);

                // 3. Create Production Order Details
                await CreateProductionOrderDetailsAsync(request, productionOrder.Id);

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                // Log exception here
                return false;
            }
        }

        private async Task<ProductionOrder> CreateProductionOrderAsync(PourGlueOrderDto request)
        {
            // Get product names for description
            var productNames = new List<string>();
            foreach (var kvp in request.ProductQuantities)
            {
                if (kvp.Value <= 0) continue;

                var planDetail = await _context.ProductionPlanDetails
                    .Include(pd => pd.Product)
                    .FirstOrDefaultAsync(pd => pd.Id == kvp.Key);

                if (planDetail?.Product != null)
                {
                    productNames.Add(planDetail.Product.ProductName);
                }
            }

            var description = "Lệnh đổ keo " + string.Join(", ", productNames);

            return new ProductionOrder
            {
                OrderDate = DateTime.Now,
                Type = "Đổ keo",
                Description = description,
                StatusDaNhapMisa = false,
                ProductionPlanId = request.ProductionPlanId
            };
        }

        private async Task CreateProductionOutputsAsync(PourGlueOrderDto request, int productionOrderId)
        {
            var productionOutputs = new List<ProductionOutput>();

            // Prepare for material creation
            var productionMaterials = new List<ProductionMaterial>();

            // First, create outputs in memory
            foreach (var kvp in request.ProductQuantities)
            {
                if (kvp.Value <= 0) continue;

                // Get the production plan detail to find the actual product
                var planDetail = await _context.ProductionPlanDetails
                    .Include(pd => pd.Product)
                    .ThenInclude(p => p.GlassStructure)
                    .FirstOrDefaultAsync(pd => pd.Id == kvp.Key);

                if (planDetail?.Product == null) continue;

                var product = planDetail.Product;
                var quantity = kvp.Value;

                // Create Production Output (not saved yet)
                var output = new ProductionOutput
                {
                    ProductId = product.Id,
                    ProductName = product.ProductName,
                    //UOM = "tấm",
                    Amount = quantity,
                    ProductionOrderId = productionOrderId,
                    OutputFor = planDetail.Id
                };
                productionOutputs.Add(output);
            }

            // Save outputs to get their IDs
            await _context.ProductionOutputs.AddRangeAsync(productionOutputs);
            await _context.SaveChangesAsync();

            // Fetch outputs with IDs (they are tracked, so we can use productionOutputs list)
            foreach (var output in productionOutputs)
            {
                // Find the corresponding planDetail
                var planDetail = await _context.ProductionPlanDetails
                    .Include(pd => pd.Product)
                    .ThenInclude(p => p.GlassStructure)
                    .FirstOrDefaultAsync(pd => pd.Id == output.OutputFor);
                if (planDetail?.Product == null) continue;

                // --- Material 1 ---
                var material1ProductName = (output.ProductName ?? "") + " chưa đổ keo";
                var material1Product = await _context.Products.FirstOrDefaultAsync(p => p.ProductName == material1ProductName);
                if (material1Product != null)
                {
                    productionMaterials.Add(new ProductionMaterial
                    {
                        //ProductionId = material1Product.Id,
                        ProductionOutputId = output.Id,
                        ProductId = material1Product.Id,
                        //ProductionName = material1Product.ProductName,
                        //UOM = material1Product.UOM,
                        Amount = output.Amount
                    });
                }

                // --- Material 2 ---
                var adhesiveType = planDetail.Product.GlassStructure?.AdhesiveType?.Trim().ToLower();
                if (adhesiveType == "nano")
                {
                    var glueProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == 3);
                    if (glueProduct != null)
                    {
                        productionMaterials.Add(new ProductionMaterial
                        {
                            //ProductionId = 3,
                            ProductionOutputId = output.Id,
                            ProductId = 3,
                            //ProductionName = glueProduct.ProductName,
                            //UOM = glueProduct.UOM,
                            Amount = planDetail.TongKeoNano
                        });
                    }
                }
                else if (adhesiveType == "mềm")
                {
                    var glueProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == 2);
                    if (glueProduct != null)
                    {
                        productionMaterials.Add(new ProductionMaterial
                        {
                            //ProductionId = 2,
                            ProductionOutputId = output.Id,
                            ProductId = 2,
                            //ProductionName = glueProduct.ProductName,
                            //UOM = glueProduct.UOM,
                            Amount = planDetail.TongKeoMem
                        });
                    }
                }
            }

            if (productionMaterials.Count > 0)
            {
                await _context.ProductionMaterials.AddRangeAsync(productionMaterials);
                await _context.SaveChangesAsync();
            }
        }

        private async Task CreateProductionOrderDetailsAsync(PourGlueOrderDto request, int productionOrderId)
        {
            var orderDetails = new List<ProductionOrderDetail>();

            // Create ProductionOrderDetails for the products that need glue pouring
            foreach (var kvp in request.ProductQuantities)
            {
                if (kvp.Value <= 0) continue;

                // Get ProductId from ProductionPlanDetail
                var planDetail = await _context.ProductionPlanDetails
                    .FirstOrDefaultAsync(pd => pd.Id == kvp.Key);
                
                if (planDetail != null)
                {
                    orderDetails.Add(new ProductionOrderDetail
                    {
                        ProductId = planDetail.ProductId,
                        Quantity = kvp.Value,
                        //TrangThai = null,
                        productionOrderId = productionOrderId
                    });
                }
            }

            await _context.ProductionOrderDetails.AddRangeAsync(orderDetails);
            await _context.SaveChangesAsync();
        }
    }
} 