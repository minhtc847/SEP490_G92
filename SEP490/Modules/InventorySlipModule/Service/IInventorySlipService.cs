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
        Task<InventorySlipDto> CreateCutGlassSlipAsync(CreateInventorySlipDto dto, MappingInfoDto mappingInfo = null);
        Task<InventorySlipDto> CreateChemicalExportSlipAsync(CreateInventorySlipDto dto);
        Task<InventorySlipDto> CreateGlueButylSlipAsync(CreateInventorySlipDto dto);
        
        Task<bool> ValidateSlipCreationAsync(CreateInventorySlipDto dto);
        Task<string> GenerateSlipCodeAsync(int productionOrderId);

        Task<bool> AddMappingsAsync(int slipId, List<CreateMaterialOutputMappingDto> mappings);		
		// Create new product for raw materials
        Task<ProductInfoDto> CreateProductAsync(CreateInventoryProductDto dto);        
        
        Task<PaginatedProductsDto> GetPaginatedProductsAsync(ProductSearchRequestDto request);
        
        Task<List<ProductionMaterialDto>> GetMaterialsByProductionOutputAsync(int productionOutputId);

        Task<bool> FinalizeInventorySlipAsync(int slipId);

        Task<InventorySlipDto> UpdateInventorySlipAsync(int id, CreateInventorySlipDto dto, MappingInfoDto mappingInfo = null);
    }
}
