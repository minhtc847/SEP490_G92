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
                    //ProductionStatus = po.ProductionStatus
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
                    //ProductionStatus = po.ProductionStatus
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
                //output.ProductionOrder.ProductionStatus = "Đang sản xuất";
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
