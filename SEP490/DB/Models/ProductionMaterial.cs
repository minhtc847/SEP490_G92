namespace SEP490.DB.Models
{
    public class ProductionMaterial
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int ProductionOutputId { get; set; }
        public UOM? UOM { get; set; }
        public decimal? Amount { get; set; }
        public ProductionOutput ProductionOutput { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
