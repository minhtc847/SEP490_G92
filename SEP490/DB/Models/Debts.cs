using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEP490.DB.Models
{
    public class Debts
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int? InvoiceId { get; set; }
        public InvoiceType InvoiceType { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; } = 0;
        public decimal RemainingAmount { get; set; } // Computed as TotalAmount - PaidAmount
        public InvoiceStatus Status { get; set; } = InvoiceStatus.Unpaid;
        public DateTime? DueDate { get; set; }
        public DateTime LastUpdated { get; set; } = DateTime.Now;
        public Customer Customer { get; set; }
        public Invoice? Invoice { get; set; }
    }
}
