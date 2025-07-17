using SEP490.Modules.MaterialModule.DTO;

namespace SEP490.Modules.MaterialModule.Services
{
    public interface IMaterialService
    {
        Task<List<MaterialChatbotResponseDTO>> GetAllMaterialsAsync();
        Task<MaterialChatbotResponseDTO?> GetMaterialByIdAsync(int id);
        Task<MaterialChatbotResponseDTO> CreateMaterialAsync(CreateMaterialChatbotDTO createDto);
        Task<MaterialChatbotResponseDTO?> UpdateMaterialAsync(int id, UpdateMaterialChatbotDTO updateDto);
        Task<bool> DeleteMaterialAsync(int id);
        Task<bool> SyncMaterialAsync(int id);
    }
} 