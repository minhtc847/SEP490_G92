using SEP490.Modules.ChemicalExportModule.DTO;

namespace SEP490.Modules.ChemicalExportModule.Service
{
    public interface IChemicalExportService
    {
        Task<ChemicalExportDto> CreateChemicalExportAsync(CreateChemicalExportDto dto);
        Task<ChemicalExportDto> GetChemicalExportByIdAsync(int id);
        Task<List<ChemicalExportDto>> GetChemicalExportsByProductionOrderAsync(int productionOrderId);
        Task<List<ChemicalExportDto>> GetAllChemicalExportsAsync();
        Task<ProductionOrderProductsDto> GetProductionOrderProductsAsync(int productionOrderId);
        Task<bool> DeleteChemicalExportAsync(int id);
    }
} 