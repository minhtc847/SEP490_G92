using Microsoft.EntityFrameworkCore;
using SEP490.Modules.InventorySlipModule.DTOs;
using SEP490.DB.Models;
using SEP490.DB;

namespace SEP490.Modules.InventorySlipModule.Services
{
    public class ProductionOrderService : IProductionOrderService
    {
        private readonly SEP490DbContext _context;

        public ProductionOrderService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<bool> CheckAndUpdateCompletionAsync(int productionOrderId)
        {
            try
            {
                var productionOutputs = await _context.ProductionOutputs
                    .Where(po => po.ProductionOrderId == productionOrderId)
                    .ToListAsync();

                if (!productionOutputs.Any())
                {
                    return false;
                }

                bool allCompleted = true;
                foreach (var po in productionOutputs)
                {
                    var finished = po.Finished ?? 0;
                    var amount = po.Amount ?? 0;
                    
                    // Convert both to decimal for accurate comparison
                    var finishedDecimal = (decimal)finished;
                    var amountDecimal = amount;
                    var isCompleted = finishedDecimal >= amountDecimal;
                    
                    if (!isCompleted)
                    {
                        allCompleted = false;
                    }
                }

                if (allCompleted)
                {
                    var productionOrder = await _context.ProductionOrders
                        .FirstOrDefaultAsync(po => po.Id == productionOrderId);

                    if (productionOrder != null)
                    {
                        productionOrder.Status = ProductionStatus.Completed; // Đã hoàn thành
                        await _context.SaveChangesAsync();
                        return true;
                    }
                }

                return false;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<ProductionOrderInfoDto> GetProductionOrderInfoAsync(int productionOrderId)
        {
            try
            {
                var productionOrder = await _context.ProductionOrders
                    .Include(po => po.ProductionPlan)
                    .FirstOrDefaultAsync(po => po.Id == productionOrderId);

                if (productionOrder == null)
                {
                    return null!;
                }

                var productionOutputs = await _context.ProductionOutputs
                    .Include(po => po.Product)
                    .Where(po => po.ProductionOrderId == productionOrderId)
                    .ToListAsync();

                var result = new ProductionOrderInfoDto
                {
                    Id = productionOrder.Id,
                    ProductionOrderCode = productionOrder.ProductionOrderCode,
                    Type = productionOrder.Type,
                    Description = productionOrder.Description,
                    Status = (int)(productionOrder.Status ?? ProductionStatus.Pending),
                    ProductionOutputs = productionOutputs.Select(po => new ProductionOutputDto
                    {
                        Id = po.Id,
                        ProductId = po.ProductId,
                        ProductName = po.Product.ProductName,
                        Uom = po.UOM?.ToString(),
                        Amount = po.Amount ?? 0,
                        Finished = po.Finished ?? 0,
                        Defected = po.Defected ?? 0
                    }).ToList(),
                    AvailableProducts = new List<ProductInfoDto>() // Sẽ được cập nhật sau
                };

                result.RawMaterials = result.AvailableProducts
                    .Where(p => p.ProductType == "NVL" || p.ProductType == "Nguyên vật liệu")
                    .ToList();

                result.SemiFinishedProducts = result.AvailableProducts
                    .Where(p => p.ProductType == "Bán thành phẩm")
                    .ToList();

                result.GlassProducts = result.AvailableProducts
                    .Where(p => p.ProductType == "Kính dư")
                    .ToList();

                return result;
            }
            catch (Exception)
            {
                return null!;
            }
        }
    }
}
