namespace SEP490.DB.Models
{
    public class ProductionOutput
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public UOM? UOM { get; set; }
        public decimal? Amount { get; set; }
        public int? Finished { get; set; } = 0;
        public int? Defected { get; set; } = 0;
        public int? ProductionOrderId { get; set; }
        public int? OutputFor { get; set; }
        public ProductionOrder ProductionOrder { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }

    public enum UOM
    {
        Tấm,
        Kg,
        M,
        L,
        Ml,
        g
    }
}
