namespace SEP490.Modules.ProductionOrders.DTO
{
    public class CutGlassInvoiceOutputCreateDto
    {
        public int CutGlassInvoiceMaterialId { get; set; }
        public int ProductionOutputId { get; set; }
        public decimal Quantity { get; set; }
        public bool IsDC { get; set; }
        public string? Note { get; set; }
    }
} 