namespace SEP490.Modules.ProductionOrders.DTO
{
    public class ProductionOutputDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal? Amount { get; set; }
        public int? Done { get; set; }
        public int? Broken { get; set; }
        public string? ReasonBroken { get; set; }
        public int? ProductionOrderId { get; set; }
    }

    public class ReportBrokenOutputDto
    {
        public int Broken { get; set; }
        public string ReasonBroken { get; set; } = string.Empty;
    }
} 