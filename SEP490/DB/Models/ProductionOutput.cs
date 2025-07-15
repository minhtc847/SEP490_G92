namespace SEP490.DB.Models
{
    public class ProductionOutput
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? UOM { get; set; }
        public decimal? Amount { get; set; }
        public string? CostObject { get; set; }
        public int? ProductionOrderId { get; set; }
        public int? OutputFor { get; set; } // ID của ProductionPlanDetail mà output này phục vụ
        public ProductionOrder ProductionOrder { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
