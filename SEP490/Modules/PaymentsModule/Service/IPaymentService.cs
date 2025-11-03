using SEP490.Modules.PaymentsModule.DTO;

namespace SEP490.Modules.PaymentsModule.Service
{
    public interface IPaymentService
    {
        List<PaymentDto> GetPaymentsByInvoiceId(int invoiceId);
        PaymentDto? GetPaymentById(int id);
        int CreatePayment(CreatePaymentDto createPaymentDto);
        bool UpdatePayment(int id, CreatePaymentDto updatePaymentDto);
        bool DeletePayment(int id);
        decimal GetTotalPaidAmount(int invoiceId);
        void UpdateInvoiceStatus(int invoiceId);
    }
} 