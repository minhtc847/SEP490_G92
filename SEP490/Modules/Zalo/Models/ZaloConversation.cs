namespace SEP490.Modules.Zalo.Models
{
    /// <summary>
    /// Simple conversation message từ Zalo API
    /// </summary>
    public class ZaloConversationMessage
    {
        public string MessageId { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string SenderId { get; set; } = string.Empty;
        public bool IsFromUser { get; set; } // true nếu từ user, false nếu từ bot
    }

    /// <summary>
    /// Current conversation session được tìm từ history
    /// </summary>
    public class ConversationSession
    {
        public string UserId { get; set; } = string.Empty;
        public string? UserPhone { get; set; }
        public List<ZaloConversationMessage> Messages { get; set; } = new List<ZaloConversationMessage>();
        public DateTime SessionStart { get; set; }
        public OrderingState CurrentState { get; set; } = OrderingState.Idle;
        public PartialOrder? PendingOrder { get; set; }
    }

    /// <summary>
    /// State của quá trình đặt hàng multi-step
    /// </summary>
    public enum OrderingState
    {
        Idle,                   // Không đang order
        WaitingForProductCode,  // Đang chờ mã sản phẩm
        WaitingForDimensions,   // Đang chờ kích thước
        WaitingForQuantity,     // Đang chờ số lượng
        WaitingForConfirmation, // Đang chờ xác nhận
        AddingMoreItems         // Đang thêm item tiếp theo
    }

    /// <summary>
    /// Đơn hàng đang được build dần qua nhiều messages
    /// </summary>
    public class PartialOrder
    {
        public string UserPhone { get; set; } = string.Empty;
        public List<PartialOrderItem> Items { get; set; } = new List<PartialOrderItem>();
        public PartialOrderItem? CurrentItem { get; set; }
    }

    public class PartialOrderItem
    {
        public string? ProductCode { get; set; }
        public string? Height { get; set; }
        public string? Width { get; set; }
        public decimal? Thickness { get; set; }
        public int? Quantity { get; set; }

        public bool IsComplete => 
            !string.IsNullOrEmpty(ProductCode) && 
            !string.IsNullOrEmpty(Height) && 
            !string.IsNullOrEmpty(Width) && 
            Thickness.HasValue && 
            Quantity.HasValue;
    }

    /// <summary>
    /// Response từ Zalo Conversation API (simplified)
    /// </summary>
    public class ZaloConversationResponse
    {
        public List<ZaloConversationMessage> Messages { get; set; } = new List<ZaloConversationMessage>();
        public bool HasMore { get; set; }
        public string? NextCursor { get; set; }
    }
} 