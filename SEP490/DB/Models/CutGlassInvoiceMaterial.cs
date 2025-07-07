namespace SEP490.DB.Models
{
    public class CutGlassInvoiceMaterial
    {
        public int Id { get; set; }
        public int ExportInvoiceId { get; set; }
        public string materialName { get; set; }
        public int materialType { get; set; } // 4ly, 5ly

        public int quantity { get; set; } // So luong
        public string? note { get; set; } = string.Empty;

        public ExportInvoice ExportInvoice { get; set; } = null!;
    }
}
