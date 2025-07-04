namespace SEP490.DB.Models
{
    public class DeliveryHistory
    {
        public int Id { get; set; }
        public int ProductionPlanId { get; set; }
        public string? Note { get; set; }
        public DateTime DeliveryDate { get; set; }
        public int QuantityDelivery { get; set; }
        public int ProductId { get; set; }

        public Product Product { get; set; } = null!;
        public ProductionPlan ProductionPlan { get; set; } = null!; 
        public ICollection<DeliveryHistoryDetail> DeliveryDetails { get; set; } = new List<DeliveryHistoryDetail>();
    }
}
