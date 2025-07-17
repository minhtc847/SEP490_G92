using Microsoft.EntityFrameworkCore;
using SEP490.DB.Models;
using SEP490.DB;
using SEP490.Modules.MaterialModule.DTO;
using SEP490.Common.Services;

namespace SEP490.Modules.MaterialModule.Services
{
    public class MaterialService : BaseService, IMaterialService
    {
        private readonly SEP490DbContext _context;

        public MaterialService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<List<MaterialChatbotResponseDTO>> GetAllMaterialsAsync()
        {
            var materials = await _context.Materials
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return materials.Select(MapToDTO).ToList();
        }

        public async Task<MaterialChatbotResponseDTO?> GetMaterialByIdAsync(int id)
        {
            var material = await _context.Materials.FindAsync(id);
            return material != null ? MapToDTO(material) : null;
        }

        public async Task<MaterialChatbotResponseDTO> CreateMaterialAsync(CreateMaterialChatbotDTO createDto)
        {
            var material = new Material
            {
                Name = createDto.Name,
                Description = createDto.Description,
                Content = createDto.Content,
                Status = "pending",
                CreatedAt = DateTime.UtcNow,
                ChunkCount = 0
            };

            _context.Materials.Add(material);
            await _context.SaveChangesAsync();

            // TODO: Start background task for embedding processing
            await ProcessEmbeddingsAsync(material.Id);

            return MapToDTO(material);
        }

        public async Task<MaterialChatbotResponseDTO?> UpdateMaterialAsync(int id, UpdateMaterialChatbotDTO updateDto)
        {
            var material = await _context.Materials.FindAsync(id);
            if (material == null)
                return null;

            if (!string.IsNullOrEmpty(updateDto.Name))
                material.Name = updateDto.Name;
            
            if (updateDto.Description != null)
                material.Description = updateDto.Description;
            
            if (!string.IsNullOrEmpty(updateDto.Content)){
                material.Content = updateDto.Content;
                material.Status = "pending";
                material.ChunkCount = 0;                // TODO: Re-process embeddings
                await ProcessEmbeddingsAsync(material.Id);
            }

            await _context.SaveChangesAsync();
            return MapToDTO(material);
        }

        public async Task<bool> DeleteMaterialAsync(int id)
        {
            var material = await _context.Materials.FindAsync(id);
            if (material == null)
                return false;

            // TODO: Delete embeddings from vector database
            _context.Materials.Remove(material);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SyncMaterialAsync(int id)
        {
            var material = await _context.Materials.FindAsync(id);
            if (material == null)
                return false;

            material.Status = "syncing";
            await _context.SaveChangesAsync();

            // TODO: Re-process embeddings
            await ProcessEmbeddingsAsync(material.Id);
            return true;
        }

        private async Task ProcessEmbeddingsAsync(int materialId)
        {
            // TODO: Implement embedding processing
            // 1. Chunk the content
            // 2. Generate embeddings
            // 3. Store in vector database
            // 4. Update status to "ready" and chunk count
            await Task.Delay(1000); // Placeholder
        }

        private static MaterialChatbotResponseDTO MapToDTO(Material material)
        {
            return new MaterialChatbotResponseDTO
            {
                Id = material.Id,
                Name = material.Name,
                Description = material.Description,
                Content = material.Content,
                Status = material.Status,
                CreatedAt = material.CreatedAt,
                ChunkCount = material.ChunkCount
            };
        }
    }
} 