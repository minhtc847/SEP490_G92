using SEP490.Modules.Accountant.DTO;
using SEP490.Modules.ProductionOrders;

namespace SEP490.Modules.Accountant.Services
{
    public interface IProductionAccountantService
    {
        List<AccountantDTO> GetAll();

        List<ProductionOrderProductDTO> GetProductsByProductionOrderId(int productionOrderId);

        Task<List<ProductWithMaterialsDTO>> GetProductAndMaterialByProductionOrderId(int productionOrderId);

        Task<ProductWithMaterialsDTO?> GetProductAndMaterialByCode(int productionOrderId, string productCode);
    }
}