using SEP490.Modules.Accountant.DTO;
using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.Accountant.Services
{
    public interface IProductionAccountantService
    {
        List<AccountantDTO> GetAll();

        List<ProductionOrderProductDTO> GetProductsByProductionOrderId(int productionOrderId);

        //Task<List<ProductWithMaterialsDTO>> GetProductAndMaterialByProductionOrderId(int productionOrderId);

        //Task<ProductWithMaterialsDTO?> GetProductAndMaterialByCode(int productionOrderId, string productCode);
        Task<ProductWithMaterialsDTO?> GetProductAndMaterialByOutputId(int outputId);
        Task<bool> CreateOutputInfo(int productionOrderId, CreateOutputDTO dto);
        Task<bool> AddMaterialAsync(int productionOrderId, int outputId, CreateMaterialDTO dto);

        Task<bool> UpdateOutputInfo(int id, UpdateOutputDTO dto);
        Task<bool> UpdateMaterialInfo(int id, UpdateMaterialDTO dto);

    }
}