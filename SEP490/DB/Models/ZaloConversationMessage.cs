using System.ComponentModel.DataAnnotations;

namespace SEP490.DB.Models
{
    public class ZaloConversationMessage
    {
        public int Id { get; set; }
        
        public int ZaloConversationStateId { get; set; }
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        [Required]
        public string SenderType { get; set; } = string.Empty; // "user" or "business"
        
        [Required]
        public string MessageType { get; set; } = "text";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public ZaloConversationState ZaloConversationState { get; set; } = null!;
    }
}
