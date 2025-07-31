using SEP490.DB.Models;

namespace SEP490.Modules.Delivery.DTO
{
    public class DeliveryDto
    {
        public int Id { get; set; }
        public int SalesOrderId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public DateTime? DeliveryDate { get; set; }
        public DateTime? ExportDate { get; set; }
        public DeliveryStatus Status { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal TotalAmount { get; set; }
    }
} 