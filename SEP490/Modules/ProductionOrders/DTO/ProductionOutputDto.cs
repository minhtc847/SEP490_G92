namespace SEP490.Modules.ProductionOrders.DTO
{
    public class ProductionOutputDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal? Amount { get; set; }
        public int? Done { get; set; }
        public string? Note { get; set; }
        public int? ProductionOrderId { get; set; }
    }
} 