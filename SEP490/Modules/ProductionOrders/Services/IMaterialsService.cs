using SEP490.DB.Models;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface IMaterialsService
    {
        Task<List<ProductionMaterial>> GetMaterialsByProductIdAsync(int productId, int productionOutputId);
        Task<decimal> CalculateButylLength(int productId);
        Task<int?> GetButylProductIdByGlassProduct(int glassProductId);
        Task<decimal> CalculateAdhesiveAmount(int glassProductId);
        Task<List<ProductionMaterial>> AddMaterialsForProductAsync(int glassProductId, int productionOutputId);
    }
}
