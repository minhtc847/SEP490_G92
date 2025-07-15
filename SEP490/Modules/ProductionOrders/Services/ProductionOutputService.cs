using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Common.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class ProductionOutputService : BaseService, IProductionOutputService
    {
        private readonly SEP490DbContext _context;
        public ProductionOutputService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductionOutputDto>> GetByProductionOrderIdAsync(int productionOrderId)
        {
            var outputs = await _context.ProductionOutputs
                .Where(x => x.ProductionOrderId == productionOrderId)
                .Include(x => x.Product)
                .ToListAsync();
            return outputs.Select(x => new ProductionOutputDto
            {
                Id = x.Id,
                ProductId = x.ProductId,
                ProductName = x.Product?.ProductName,
                UOM = x.UOM,
                Amount = x.Amount,
                CostObject = x.CostObject,
                ProductionOrderId = (int)x.ProductionOrderId
            }).ToList();
        }
    }
} 