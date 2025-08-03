using SEP490.DB.Models;

namespace SEP490.Modules.InvoiceModule.DTO
{
    public class CreateInvoiceDto
    {
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
        public int CustomerId { get; set; }
        public string? Note { get; set; }
        public List<CreateInvoiceDetailDto> InvoiceDetails { get; set; } = new();
    }

    public class CreateInvoiceDetailDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Total { get; set; }
        public string? Description { get; set; }
    }
} 