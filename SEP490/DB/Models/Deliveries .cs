

namespace SEP490.DB.Models
{
    public class Delivery
    {
        public int Id { get; set; }
        public int SalesOrderId { get; set; }
        public DateTime DeliveryDate { get; set; }
        public DeliveryStatus Status { get; set; } = DeliveryStatus.Delivering;
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public SaleOrder SalesOrder { get; set; }
    }
}
