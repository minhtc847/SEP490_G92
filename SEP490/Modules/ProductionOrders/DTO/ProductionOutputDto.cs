namespace SEP490.Modules.ProductionOrders.DTO
{
    public class ProductionOutputDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? UOM { get; set; }
        public decimal? Amount { get; set; }
        public string? CostObject { get; set; }
        public int ProductionOrderId { get; set; }
    }
} 