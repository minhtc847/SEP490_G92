using System.ComponentModel.DataAnnotations;

namespace SEP490.Modules.MaterialModule.DTO
{
    public class CreateMaterialChatbotDTO
    {
        [Required]
        [StringLength(255)]
        public string Name { get; set; }
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        [Required]
        public string Content { get; set; }
        public string? FilePath { get; set; }
    }

    public class UpdateMaterialChatbotDTO
    {
        [StringLength(255)]
        public string? Name { get; set; }
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        public string? Content { get; set; }
        public string? FilePath { get; set; }
        }

    public class MaterialChatbotResponseDTO
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string Content { get; set; }
        public string Status { get; set; }
        public string? FilePath { get; set; }
        public DateTime CreatedAt { get; set; }
        public int ChunkCount { get; set; }
    }
} 