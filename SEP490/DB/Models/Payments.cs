using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEP490.DB.Models
{
    public class Payments
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int InvoiceId { get; set; }
        public InvoiceType InvoiceType { get; set; }
        public DateTime PaymentDate { get; set; }
        public decimal Amount { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public Customer Customer { get; set; }
        public Invoice Invoice { get; set; }
    }
}
