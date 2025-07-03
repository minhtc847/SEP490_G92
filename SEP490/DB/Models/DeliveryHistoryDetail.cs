namespace SEP490.DB.Models
{
    public class DeliveryHistoryDetail
    {
        public int Id { get; set; }

        public int DeliveryHistoryId { get; set; }

        public DateTime DeliveryDate { get; set; }

        public int QuantityDelivered { get; set; }

        public DeliveryHistory? DeliveryHistory { get; set; }
    }
}
