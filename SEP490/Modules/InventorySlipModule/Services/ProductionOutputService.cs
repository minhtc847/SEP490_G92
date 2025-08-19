using Microsoft.EntityFrameworkCore;
using SEP490.Modules.InventorySlipModule.DTOs;
using SEP490.DB.Models;
using SEP490.DB;

namespace SEP490.Modules.InventorySlipModule.Services
{
    public class ProductionOutputService : IInventoryProductionOutputService
    {
        private readonly SEP490DbContext _context;

        public ProductionOutputService(SEP490DbContext context)
        {
            _context = context;
        }
        public async Task<bool> UpdateFinishedQuantityAsync(int productionOutputId, decimal finishedQuantity)
        {
            try
            {
                
                var productionOutput = await _context.ProductionOutputs
                    .FirstOrDefaultAsync(po => po.Id == productionOutputId);

                if (productionOutput == null)
                {
                    Console.WriteLine($"✗ ProductionOutput not found with ID: {productionOutputId}");
                    return false;
                }

                
                if (finishedQuantity <= 0)
                {
                    Console.WriteLine($"✗ Invalid finishedQuantity: {finishedQuantity}");
                    return false;
                }

                // Cập nhật số lượng hoàn thành dùng decimal
                var oldFinished = productionOutput.Finished ?? 0m;
                var newFinished = oldFinished + finishedQuantity;
                productionOutput.Finished = newFinished;                

                if (productionOutput.Amount.HasValue && productionOutput.Amount > 0)
                {
                    var progress = (double)newFinished / (double)productionOutput.Amount.Value * 100;
                    Console.WriteLine($"Progress: {newFinished}/{productionOutput.Amount} ({progress:F1}%)");
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"✓ Successfully saved to database");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"✗ Error updating ProductionOutput: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return false;
            }
        }
        public async Task<List<ProductionOutputDto>> GetByProductionOrderIdAsync(int productionOrderId)
        {
            try
            {
                var outputs = await _context.ProductionOutputs
                    .Where(po => po.ProductionOrderId == productionOrderId)
                    .Select(po => new ProductionOutputDto
                    {
                        Id = po.Id,
                        ProductId = po.ProductId,
                        ProductName = po.Product.ProductName,
                        Uom = po.Product != null ? po.Product.UOM : null,
                        Amount = po.Amount ?? 0,
                        Finished = po.Finished ?? 0,
                        Defected = po.Defected ?? 0
                    })
                    .ToListAsync();

                return outputs;
            }
            catch (Exception)
            {
                return new List<ProductionOutputDto>();
            }
        }
    }
}
