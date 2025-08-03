using SEP490.Modules.InvoiceModule.DTO;

namespace SEP490.Modules.InvoiceModule.Service
{
    public interface IInvoiceService
    {
        List<InvoiceDto> GetAllInvoices();
        InvoiceWithDetailsDto? GetInvoiceById(int id);
        int CreateInvoice(CreateInvoiceDto createInvoiceDto);
        bool UpdateInvoice(int id, CreateInvoiceDto updateInvoiceDto);
        bool DeleteInvoice(int id);
    }
} 