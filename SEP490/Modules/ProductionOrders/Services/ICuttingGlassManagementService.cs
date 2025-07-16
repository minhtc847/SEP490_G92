using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface ICuttingGlassManagementService
    {
        Task<List<Product>> GetThanhPhamProductsAsync();
        Task<object> GetCuttingGlassSummaryAsync(int productionOrderId);
        Task<Product> CreateProductAsync(CreateProductionProductDto dto);
        Task<ProductionOutput> CreateProductionOutputAsync(CreateProductionOutputDto dto);
        Task<CutGlassInvoiceMaterial> CreateMaterialAsync(CutGlassInvoiceMaterial material);
        Task<CutGlassInvoiceOutput> CreateCutGlassOutputAsync(CutGlassInvoiceOutputCreateDto dto);
        Task<CutGlassInvoiceMaterial> UpdateMaterialAsync(int id, UpdateMaterialDto dto);
        Task<CutGlassInvoiceOutput> UpdateCutGlassOutputAsync(int id, UpdateCutGlassOutputDto dto);
        Task DeleteMaterialAsync(int id);
        Task DeleteCutGlassOutputAsync(int id);
    }
} 