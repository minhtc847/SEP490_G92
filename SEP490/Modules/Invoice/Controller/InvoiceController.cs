using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.Invoice.DTO;
using SEP490.Modules.Invoice.Service;

namespace SEP490.Modules.Invoice.Controller
{
    [Route("api/invoices")]
    [ApiController]
    public class InvoiceController : ControllerBase
    {
        private readonly IInvoiceService _invoiceService;

        public InvoiceController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        [HttpGet]
        public ActionResult<List<InvoiceDto>> GetAllInvoices()
        {
            var invoices = _invoiceService.GetAllInvoices();
            if (invoices == null || !invoices.Any())
            {
                return NotFound("No invoices found.");
            }
            return Ok(invoices);
        }
    }
} 