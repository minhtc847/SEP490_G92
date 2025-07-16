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
                    ProductionStatus = po.ProductionStatus
                })
                .ToListAsync();

            return productionOrders;
        }


    }
}
