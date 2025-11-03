namespace SEP490.DB.Models
{
    public class DeliveryHistory
    {
        public int Id { get; set; }
        public int ProductionPlanDetailId { get; set; } // Liên kết tới sản phẩm trong kế hoạch sản xuất
        public DateTime DeliveryDate { get; set; }
        public int QuantityDelivered { get; set; }
        public string? Note { get; set; }

        public ProductionPlanDetail ProductionPlanDetail { get; set; } = null!;
    }
}
