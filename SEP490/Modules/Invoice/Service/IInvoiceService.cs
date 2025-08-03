using SEP490.Modules.Invoice.DTO;

namespace SEP490.Modules.Invoice.Service
{
    public interface IInvoiceService
    {
        List<InvoiceDto> GetAllInvoices();
    }
} 