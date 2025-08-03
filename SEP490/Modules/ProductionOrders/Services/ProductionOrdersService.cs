using Microsoft.AspNetCore.Mvc;
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
                .OrderByDescending(po => po.OrderDate)
                .Select(po => new ProductionOrdersByPlanDto
                {
                    ProductionOrderId = po.Id,
                    OrderDate = po.OrderDate,
                    Type = po.Type,
                    Description = po.Description,
                    
                })
                .ToListAsync();

            return productionOrders;
        }

        public async Task<List<ProductionOrdersByPlanDto>> GetAllProductionOrdersAsync()
        {
            var productionOrders = await _context.ProductionOrders
                .OrderByDescending(po => po.OrderDate)
                .Select(po => new ProductionOrdersByPlanDto
                {
                    ProductionOrderId = po.Id,
                    OrderDate = po.OrderDate,
                    Type = po.Type,
                    Description = po.Description,
                    
                })
                .ToListAsync();
            return productionOrders;
        }

        public async Task<List<ProductionOutputDto>> GetProductionOutputsByOrderIdAsync(int productionOrderId)
        {
            var outputs = await _context.ProductionOutputs
                .Where(po => po.ProductionOrderId == productionOrderId)
                .Select(po => new ProductionOutputDto
                {
                    Id = po.Id,
                    ProductId = po.ProductId,
                    ProductName = po.ProductName,
                    Amount = po.Amount,
                    Done = po.Finished,
                    Broken = po.Defected,
                    ProductionOrderId = po.ProductionOrderId
                })
                .ToListAsync();
            return outputs;
        }

        public async Task<List<ProductionDefectDto>> GetProductionDefectsByOrderIdAsync(int productionOrderId)
        {
            var defects = await _context.ProductionDefects
                .Include(pd => pd.Product)
                .Where(pd => pd.ProductionOrderId == productionOrderId)
                .OrderByDescending(pd => pd.ReportedAt)
                .Select(pd => new ProductionDefectDto
                {
                    Id = pd.Id,
                    ProductionOrderId = pd.ProductionOrderId,
                    ProductId = pd.ProductId,
                    ProductName = pd.Product != null ? pd.Product.ProductName : null,
                    Quantity = pd.Quantity,
                    DefectType = pd.DefectType,
                    DefectStage = pd.DefectStage,
                    Note = pd.Note,
                    ReportedAt = pd.ReportedAt
                })
                .ToListAsync();
            return defects;
        }

        public async Task<bool> CreateDefectReportAsync(CreateDefectReportDto dto)
        {
            try
            {
                // Validate that the production order and product exist
                var productionOrder = await _context.ProductionOrders.FindAsync(dto.ProductionOrderId);
                if (productionOrder == null) return false;

                var product = await _context.Products.FindAsync(dto.ProductId);
                if (product == null) return false;

                // Find the corresponding ProductionOutput to update Defected count
                var productionOutput = await _context.ProductionOutputs
                    .FirstOrDefaultAsync(po => po.ProductionOrderId == dto.ProductionOrderId && po.ProductId == dto.ProductId);
                
                if (productionOutput == null) return false;

                // Create defect report
                var defect = new ProductionDefects
                {
                    ProductionOrderId = dto.ProductionOrderId,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                    DefectType = dto.DefectType,
                    DefectStage = dto.DefectStage,
                    Note = dto.Note,
                    ReportedAt = DateTime.UtcNow
                };

                _context.ProductionDefects.Add(defect);

                // Update Defected count in ProductionOutput
                // This ensures the "Số lượng hỏng" column shows the total of all defect reports
                productionOutput.Defected = (productionOutput.Defected ?? 0) + dto.Quantity;

                // Update Finished count (reduce by defected quantity)
                // Finished products should decrease when we report defects
                productionOutput.Finished = Math.Max((productionOutput.Finished ?? 0) - dto.Quantity, 0);

                // Update production order status if needed
                if (productionOrder != null)
                {
                    productionOrder.Status = ProductionStatus.InProgress;
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> UpdateDefectReportAsync(int defectId, UpdateDefectReportDto dto)
        {
            try
            {
                // Find the existing defect record
                var existingDefect = await _context.ProductionDefects.FindAsync(defectId);
                if (existingDefect == null) return false;

                // Get the old quantity to calculate the difference
                var oldQuantity = existingDefect.Quantity ?? 0;
                var newQuantity = dto.Quantity;
                var quantityDifference = newQuantity - oldQuantity;

                // Find the corresponding ProductionOutput to update Defected count
                var productionOutput = await _context.ProductionOutputs
                    .FirstOrDefaultAsync(po => po.ProductionOrderId == existingDefect.ProductionOrderId && po.ProductId == existingDefect.ProductId);
                
                if (productionOutput == null) return false;

                // Update the defect record
                existingDefect.Quantity = dto.Quantity;
                existingDefect.DefectType = dto.DefectType;
                existingDefect.DefectStage = dto.DefectStage;
                existingDefect.Note = dto.Note;
                existingDefect.ReportedAt = DateTime.UtcNow; // Update report time

                // Update ProductionOutput Defected count based on quantity change
                productionOutput.Defected = (productionOutput.Defected ?? 0) + quantityDifference;

                // Update Finished count (adjust by quantity difference)
                productionOutput.Finished = Math.Max((productionOutput.Finished ?? 0) - quantityDifference, 0);

                // Update production order status
                var productionOrder = await _context.ProductionOrders.FindAsync(existingDefect.ProductionOrderId);
                if (productionOrder != null)
                {
                    productionOrder.Status = ProductionStatus.InProgress;
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> ReportBrokenOutputAsync(int outputId, ReportBrokenOutputDto dto)
        {
            var output = await _context.ProductionOutputs.Include(o => o.ProductionOrder).FirstOrDefaultAsync(o => o.Id == outputId);
            if (output == null || dto.Broken <= 0) return false;

            // Update broken count
            output.Defected = (output.Defected ?? 0) + dto.Broken;

            // Update done
            output.Finished = Math.Max((output.Finished ?? 0) - dto.Broken, 0);

            // Update production order status
            if (output.ProductionOrder != null)
            {
                output.ProductionOrder.Status = ProductionStatus.InProgress;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
