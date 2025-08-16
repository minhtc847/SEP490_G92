using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class CreateGelOrderService : BaseTransientService, ICreateGelOrderService
    {
        private readonly SEP490DbContext _context;

        public CreateGelOrderService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateGelOrderAsync(CreateGelOrderDto request)
        {
            try
            {
                using var transaction = await _context.Database.BeginTransactionAsync();

                // 1. Create Production Order for Gel Manufacturing
                var productionOrder = await CreateProductionOrderAsync(request);
                await _context.ProductionOrders.AddAsync(productionOrder);
                await _context.SaveChangesAsync();

                // 2. Create Production Outputs (Keo Nano and Keo Mem)
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

        private async Task<ProductionOrder> CreateProductionOrderAsync(CreateGelOrderDto request)
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

            var description = "Lệnh sản xuất keo " + string.Join(", ", productNames);

            return new ProductionOrder
            {
                OrderDate = DateTime.Now,
                Type = "Sản xuất keo",
                Description = description,
                StatusDaNhapMisa = false,

                ProductionPlanId = request.ProductionPlanId
            };
        }

        private async Task CreateProductionOutputsAsync(CreateGelOrderDto request, int productionOrderId)
        {
            var productionOutputs = new List<ProductionOutput>();
            var productionMaterials = new List<ProductionMaterial>();

            // Helper function to add materials for a given output
            async Task AddMaterialsForOutput(decimal outputAmount, string formularType, int productionOutputId)
            {
                // Lấy các formular theo type
                var formulars = await _context.Formulars
                    .Where(f => f.Type == formularType)
                    .ToListAsync();
                foreach (var formular in formulars)
                {
                    if (formular.ProductId == null) continue;
                    var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == formular.ProductId);
                    if (product == null) continue;
                    productionMaterials.Add(new ProductionMaterial
                    {
                        //ProductionId = formular.ProductId.Value,
                        ProductionOutputId = productionOutputId,
                        ProductId = formular.ProductId.Value,
                        //UOM = product.UOM,
                        Amount = (decimal)outputAmount * (decimal)formular.Ratio / 100m
                    });
                }
            }

            // Add Keo Nano (Product ID = 3) if needed
            if (request.TotalKeoNano > 0)
            {
                var keoNanoProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == 3);
                if (keoNanoProduct != null)
                {
                    var output = new ProductionOutput
                    {
                        ProductId = keoNanoProduct.Id,
                        ProductName = keoNanoProduct.ProductName ?? "Keo Nano",
                        //UOM = "kg",
                        Amount = request.TotalKeoNano,
                        ProductionOrderId = productionOrderId
                    };
                    await _context.ProductionOutputs.AddAsync(output);
                    await _context.SaveChangesAsync();
                    productionOutputs.Add(output);
                    // Tạo materials cho Keo Nano
                    await AddMaterialsForOutput(request.TotalKeoNano, "Nano", output.Id);
                }
            }

            // Add Keo Mem (Product ID = 2) if needed
            if (request.TotalKeoMem > 0)
            {
                var keoMemProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == 2);
                if (keoMemProduct != null)
                {
                    var output = new ProductionOutput
                    {
                        ProductId = keoMemProduct.Id,
                        ProductName = keoMemProduct.ProductName ?? "Chất đông keo (Keo Mềm)",
                        //UOM = "kg",
                        Amount = request.TotalKeoMem,
                        ProductionOrderId = productionOrderId
                    };
                    await _context.ProductionOutputs.AddAsync(output);
                    await _context.SaveChangesAsync();
                    productionOutputs.Add(output);
                    // Tạo materials cho Keo Mềm
                    await AddMaterialsForOutput(request.TotalKeoMem, "Mem", output.Id);
                }
            }

            // Không cần AddRangeAsync cho productionOutputs vì đã add từng cái ở trên
            if (productionMaterials.Count > 0)
            {
                await _context.Set<ProductionMaterial>().AddRangeAsync(productionMaterials);
                await _context.SaveChangesAsync();
            }
        }

        private async Task CreateProductionOrderDetailsAsync(CreateGelOrderDto request, int productionOrderId)
        {
            var orderDetails = new List<ProductionOrderDetail>();

            // Create ProductionOrderDetails for the products that need glue manufacturing
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