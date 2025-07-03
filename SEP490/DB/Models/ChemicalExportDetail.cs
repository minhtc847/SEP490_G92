namespace SEP490.DB.Models
{
    public class ChemicalExportDetail
    {
        public int Id { get; set; }
        public int ExportInvoiceId { get; set; }
        public int ProductId { get; set; }
        public decimal Quantity { get; set; }
        public string? UOM { get; set; }
        public ExportInvoice ExportInvoice { get; set; } = null!;
        
    }
}
