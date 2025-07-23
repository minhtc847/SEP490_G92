using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEP490.DB.Models
{
    public class Invoice
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public InvoiceType InvoiceType { get; set; }
        public int? RelatedOrderId { get; set; }
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public decimal? Subtotal { get; set; }
        public decimal? Tax { get; set; }
        public decimal? TotalAmount { get; set; } // Computed as Subtotal + Tax
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Unpaid;
        public Customer Customer { get; set; }
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
