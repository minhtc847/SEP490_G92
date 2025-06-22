namespace SEP490.DB.Models
{
    public class ProductionMaterial
    {
        public int Id { get; set; }
        public int ProductionId { get; set; }
        public string? ProductionName { get; set; }
        public int ProductionOutputId { get; set; }
        public string? UOM { get; set; }
        public decimal? Amount { get; set; }
        public string? CostObject { get; set; }
        public string? CostItem { get; set; }
        public ProductionOutput ProductionOutput { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
