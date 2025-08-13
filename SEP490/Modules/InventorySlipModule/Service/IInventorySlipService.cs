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

        Task<InventorySlipDto> CreateCutGlassSlipAsync(CreateInventorySlipDto dto);
        Task<InventorySlipDto> CreateChemicalExportSlipAsync(CreateInventorySlipDto dto);
        Task<InventorySlipDto> CreateGlueButylSlipAsync(CreateInventorySlipDto dto);
        
        Task<bool> ValidateSlipCreationAsync(CreateInventorySlipDto dto);
        Task<string> GenerateSlipCodeAsync(int productionOrderId, string transactionType);

        // Accept create-mapping DTO for adding mappings
        Task<bool> AddMappingsAsync(int slipId, List<CreateMaterialOutputMappingDto> mappings);
		
		        // Create new product for raw materials
        Task<ProductInfoDto> CreateProductAsync(CreateInventoryProductDto dto);
        
        // Update existing inventory slip
        Task<InventorySlipDto> UpdateInventorySlipAsync(int id, CreateInventorySlipDto dto);
    }
}
