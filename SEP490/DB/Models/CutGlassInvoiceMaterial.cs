namespace SEP490.DB.Models
{
    public class CutGlassInvoiceMaterial
    {
        public int Id { get; set; }
        public int quantity { get; set; } // So luong
        public string? note { get; set; } = string.Empty;
        public int productionOrderId { get; set; }
        public int productId { get; set; }

        public ProductionOrder? ProductionOrder { get; set; } = null!;
        public Product? Product { get; set; } = null!;
    }
}
