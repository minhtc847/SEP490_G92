namespace SEP490.Modules.Delivery.DTO
{
    public class DeliveryHistoryDto
    {
        public int Id { get; set; }
        public string DeliveryDate { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? Note { get; set; }
    }

    public class CreateDeliveryHistoryDto
    {
        public string DeliveryDate { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? Note { get; set; }
    }
} 