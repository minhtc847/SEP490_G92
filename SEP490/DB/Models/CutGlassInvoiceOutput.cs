namespace SEP490.DB.Models
{
    public class CutGlassInvoiceOutput
    {
        public int Id { get; set; }
        public int CutGlassInvoiceMaterialId { get; set; }
        public int Quantity { get; set; } // So luong
        public bool IsDC { get; set; } // La san pham thua
        public string? Note { get; set; } = string.Empty;
        public int ProductionOutputId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        public CutGlassInvoiceMaterial CutGlassInvoiceMaterial { get; set; } = null!;
        public ProductionOutput ProductionOutput { get; set; } = null!;
    }
}
