using SEP490.Modules.PaymentsModule.DTO;

namespace SEP490.Modules.InvoiceModule.DTO
{
    public class InvoiceWithPaymentsDto : InvoiceWithDetailsDto
    {
        public int? CustomerId { get; set; }
        public List<PaymentDto> Payments { get; set; } = new List<PaymentDto>();
        public decimal TotalPaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
    }
} 