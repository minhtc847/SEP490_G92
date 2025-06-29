namespace SEP490.DB.Models
{
    public class HistoryMessage
    {
        public int Id { get; set; }

        public string ConversationId { get; set; } = string.Empty;

        public string SenderId { get; set; } = string.Empty;

        public string SenderType { get; set; } = "user"; // "user" hoặc "business"

        public string MessageType { get; set; } = "text"; // text, image, video, ...

        public string? Content { get; set; }

        public string? MediaUrl { get; set; }

        public DateTime SendTime { get; set; }

        public DateTime? ReceivedTime { get; set; }

        public string? RawData { get; set; } // JSON gốc từ Zalo nếu muốn lưu

        public bool Processed { get; set; } = false;

        public int? OrderId { get; set; } // FK nếu đã mapping đơn hàng

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
