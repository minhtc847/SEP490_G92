using SEP490.Modules.InventorySlipModule.DTO;

namespace SEP490.Modules.InventorySlipModule.Service
{
    public interface IInventorySlipService
    {
        Task<InventorySlipDto> CreateInventorySlipAsync(CreateInventorySlipDto dto);
        Task<InventorySlipDto> GetInventorySlipByIdAsync(int id);
        Task<List<InventorySlipDto>> GetAllInventorySlipsAsync();
        Task<List<InventorySlipDto>> GetInventorySlipsByProductionOrderAsync(int productionOrderId);
        Task<bool> DeleteInventorySlipAsync(int id);
        Task<ProductionOrderInfoDto> GetProductionOrderInfoAsync(int productionOrderId);
        
        Task<List<InventorySlipDetailDto>> GetOutputsFromInputMaterialAsync(int inputDetailId);
        Task<List<InventorySlipDetailDto>> GetInputMaterialsForOutputAsync(int outputDetailId);

        Task<InventorySlipDto> CreateCutGlassSlipAsync(CreateInventorySlipDto dto, MappingInfoDto mappingInfo = null);
        Task<InventorySlipDto> CreateChemicalExportSlipAsync(CreateInventorySlipDto dto);
        Task<InventorySlipDto> CreateGlueButylSlipAsync(CreateInventorySlipDto dto);
        
        Task<bool> ValidateSlipCreationAsync(CreateInventorySlipDto dto);
        Task<string> GenerateSlipCodeAsync(int productionOrderId);

        // Accept create-mapping DTO for adding mappings
        Task<bool> AddMappingsAsync(int slipId, List<CreateMaterialOutputMappingDto> mappings);
		
		        // Create new product for raw materials
        Task<ProductInfoDto> CreateProductAsync(CreateInventoryProductDto dto);
        
        // Update existing inventory slip
        Task<InventorySlipDto> UpdateInventorySlipAsync(int id, CreateInventorySlipDto dto);
        
        // Paginated product search for cut glass slips
        Task<PaginatedProductsDto> GetPaginatedProductsAsync(ProductSearchRequestDto request);
        
        // Get materials by production output for material export slips
        Task<List<ProductionMaterialDto>> GetMaterialsByProductionOutputAsync(int productionOutputId);
    }
}
