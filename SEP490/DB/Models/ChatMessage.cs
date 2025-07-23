using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace SEP490.DB.Models
{
    public class ChatMessage
    {
        public int Id { get; set; } 
        public int EmployeeId { get; set; }
        public string Role { get; set; } // "user" hoặc "assistant"
        public string Content { get; set; }

        public int? ConversationId { get; set; }

        public string? SourceDocsJson { get; set; }

        [NotMapped]
        public JsonDocument? SourceDocs
        {
            get => SourceDocsJson != null ? JsonDocument.Parse(SourceDocsJson) : null;
            set => SourceDocsJson = value?.RootElement.ToString();
        }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Employee Employee { get; set; }
    }
}
