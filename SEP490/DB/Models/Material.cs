using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEP490.DB.Models
{
    public class Material
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string Content { get; set; }
        public string? FilePath { get; set; } 

        public string Status { get; set; } = "pending"; // pending, syncing, ready, error
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int ChunkCount { get; set; } = 0;
    }
} 