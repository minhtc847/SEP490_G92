using SEP490.DB.Models;

namespace SEP490.Modules.Invoice.DTO
{
    public class InvoiceDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string InvoiceCode { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public InvoiceType InvoiceType { get; set; }
        public InvoiceStatus Status { get; set; }
        public decimal Subtotal { get; set; }
        public decimal Tax { get; set; }
        public decimal TotalAmount { get; set; }
        public int? SalesOrderId { get; set; }
        public int? PurchaseOrderId { get; set; }
    }
} 