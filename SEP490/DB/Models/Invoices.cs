using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEP490.DB.Models
{
    public class Invoice
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public InvoiceType InvoiceType { get; set; }
        
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public int? Subtotal { get; set; }
        public decimal? Tax { get; set; }
        public int? TotalAmount { get; set; } 
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Unpaid;
        public Customer Customer { get; set; }

        public int? SalesOrderId { get; set; }
        public int? PurchaseOrderId { get; set; }

        public SaleOrder? SalesOrder { get; set; }
        public PurchaseOrder? PurchaseOrder { get; set; }
        public ICollection<InvoiceDetails> InvoiceDetails { get; set; } = new List<InvoiceDetails>();
    }

    public enum InvoiceType
    {
        Sales,
        Purchase
    }

    public enum InvoiceStatus
    {
        Unpaid,
        PartiallyPaid,
        Paid
    }
}
