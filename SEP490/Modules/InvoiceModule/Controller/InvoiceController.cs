using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.InvoiceModule.DTO;
using SEP490.Modules.InvoiceModule.Service;

namespace SEP490.Modules.InvoiceModule.Controller
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

        [HttpGet("{id}")]
        public ActionResult<InvoiceWithDetailsDto> GetInvoiceById(int id)
        {
            var invoice = _invoiceService.GetInvoiceById(id);
            if (invoice == null)
            {
                return NotFound($"Invoice with ID {id} not found.");
            }
            return Ok(invoice);
        }

        [HttpPost]
        public ActionResult<int> CreateInvoice([FromBody] CreateInvoiceDto createInvoiceDto)
        {
            try
            {
                var invoiceId = _invoiceService.CreateInvoice(createInvoiceDto);
                return Ok(new { id = invoiceId, message = "Invoice created successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Error creating invoice: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        public ActionResult UpdateInvoice(int id, [FromBody] CreateInvoiceDto updateInvoiceDto)
        {
            try
            {
                var success = _invoiceService.UpdateInvoice(id, updateInvoiceDto);
                if (!success)
                {
                    return NotFound($"Invoice with ID {id} not found.");
                }
                return Ok(new { message = "Invoice updated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Error updating invoice: {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteInvoice(int id)
        {
            try
            {
                var success = _invoiceService.DeleteInvoice(id);
                if (!success)
                {
                    return NotFound($"Invoice with ID {id} not found.");
                }
                return Ok(new { message = "Invoice deleted successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Error deleting invoice: {ex.Message}" });
            }
        }
    }
} 