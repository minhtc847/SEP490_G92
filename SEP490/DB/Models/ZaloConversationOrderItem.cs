using System.ComponentModel.DataAnnotations;

namespace SEP490.DB.Models
{
    public class ZaloConversationOrderItem
    {
        public int Id { get; set; }
        
        public int ZaloConversationStateId { get; set; }
        
        [Required]
        public string ProductCode { get; set; } = string.Empty;
        
        [Required]
        public string ProductType { get; set; } = string.Empty;
        
        public float Height { get; set; } = 0;
        
        public float Width { get; set; } = 0;
        
        public float Thickness { get; set; } = 0;
        
        public int Quantity { get; set; } = 0;
        
        public decimal UnitPrice { get; set; } = 0;
        
        public decimal TotalPrice { get; set; } = 0;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public ZaloConversationState ZaloConversationState { get; set; } = null!;
    }
}
