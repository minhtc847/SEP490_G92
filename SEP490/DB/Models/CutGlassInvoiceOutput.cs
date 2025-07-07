namespace SEP490.DB.Models
{
    public class CutGlassInvoiceOutput
    {
        public int Id { get; set; }
        public int CutGlassInvoiceMaterialId { get; set; }
        public string OutputName { get; set; } = string.Empty;
        public int OutputType { get; set; } // 4ly, 5ly,
        public int Quantity { get; set; } // So luong
        public bool IsDC { get; set; } // La san pham thua
        public string? Note { get; set; } = string.Empty;
        public CutGlassInvoiceMaterial CutGlassInvoiceMaterial { get; set; } = null!;
    }
}
