using System.ComponentModel.DataAnnotations;

namespace SEP490.DB.Models
{
    public class ZaloConversationState
    {
        public int Id { get; set; }
        
        [Required]
        public string ZaloUserId { get; set; } = string.Empty;
        
        [Required]
        public string CurrentState { get; set; } = "new";
        
        public string? CurrentOrderId { get; set; }
        
        public DateTime LastActivity { get; set; } = DateTime.UtcNow;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
        
        public int MessageCount { get; set; } = 0;
        
        [StringLength(1000)]
        public string? LastUserMessage { get; set; }
        
        [StringLength(1000)]
        public string? LastBotResponse { get; set; }
        
        public int RetryCount { get; set; } = 0;
        
        [StringLength(500)]
        public string? LastError { get; set; }
        
        [StringLength(100)]
        public string? UserName { get; set; }
        
        [StringLength(20)]
        public string? CustomerPhone { get; set; }
        
        public int? CustomerId { get; set; }
        
        // Navigation properties
        public ICollection<ZaloConversationMessage> MessageHistory { get; set; } = new List<ZaloConversationMessage>();
        public ICollection<ZaloConversationOrderItem> OrderItems { get; set; } = new List<ZaloConversationOrderItem>();
        
        // Foreign key relationship
        public Customer? Customer { get; set; }
    }
}
