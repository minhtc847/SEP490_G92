namespace SEP490.Modules.ProductionOrders.DTO
{
    public class ExportInvoiceDto
    {
        public int Id { get; set; }
        public string? EmployeeName { get; set; }
        public string? ExportDate { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; }
        public int? TotalAmount { get; set; }
        public int ProductionOrderId { get; set; }
    }
} 