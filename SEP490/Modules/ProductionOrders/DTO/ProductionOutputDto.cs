namespace SEP490.Modules.ProductionOrders.DTO
{
    public class ProductionOutputDto
    {
        public int ProductionOutputId { get; set; } 
        public int ProductId { get; set; }
        public string? ProductCode { get; set; }
        public string? ProductName { get; set; }
        public string? UOM { get; set; }
        public decimal? Amount { get; set; }
        public int OrderId { get; set; }
        public string? CostObject { get; set; }
        
    }
}
