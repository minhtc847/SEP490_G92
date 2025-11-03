using System.ComponentModel.DataAnnotations;

namespace SEP490.Modules.PaymentsModule.DTO
{
    public class PaymentDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public int InvoiceId { get; set; }
        public int InvoiceType { get; set; }
        public DateTime PaymentDate { get; set; }
        public decimal Amount { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? CustomerName { get; set; }
    }

    public class CreatePaymentDto
    {
        [Required]
        public int CustomerId { get; set; }
        
        [Required]
        public int InvoiceId { get; set; }
        
        [Required]
        public int InvoiceType { get; set; }
        
        [Required]
        public DateTime PaymentDate { get; set; }
        
        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }
        
        public string? Note { get; set; }
    }
} 