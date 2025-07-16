using SEP490.Modules.ProductionOrders.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface IProductionOutputService
    {
        Task<List<ProductionOutputDto>> GetByProductionOrderIdAsync(int productionOrderId);
    }
} 