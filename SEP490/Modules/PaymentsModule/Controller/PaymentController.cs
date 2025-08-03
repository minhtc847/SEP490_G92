using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.PaymentsModule.DTO;
using SEP490.Modules.PaymentsModule.Service;
using SEP490.Modules.Debts.Service;

namespace SEP490.Modules.PaymentsModule.Controller
{
    [Route("api/payments")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IDebtService _debtService;

        public PaymentController(IPaymentService paymentService, IDebtService debtService)
        {
            _paymentService = paymentService;
            _debtService = debtService;
        }

        [HttpGet("invoice/{invoiceId}")]
        public ActionResult<List<PaymentDto>> GetPaymentsByInvoiceId(int invoiceId)
        {
            var payments = _paymentService.GetPaymentsByInvoiceId(invoiceId);
            return Ok(payments);
        }

        [HttpGet("{id}")]
        public ActionResult<PaymentDto> GetPaymentById(int id)
        {
            var payment = _paymentService.GetPaymentById(id);
            if (payment == null)
            {
                return NotFound($"Payment with ID {id} not found.");
            }
            return Ok(payment);
        }

        [HttpPost]
        public ActionResult<int> CreatePayment([FromBody] CreatePaymentDto createPaymentDto)
        {
            try
            {
                var paymentId = _paymentService.CreatePayment(createPaymentDto);
                
                // Update debt information after payment creation
                _debtService.UpdateDebtFromInvoice(createPaymentDto.InvoiceId);
                
                return Ok(new { id = paymentId, message = "Payment created successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Error creating payment: {ex.Message}" });
            }
        }

        [HttpPut("{id}")]
        public ActionResult<bool> UpdatePayment(int id, [FromBody] CreatePaymentDto updatePaymentDto)
        {
            try
            {
                var result = _paymentService.UpdatePayment(id, updatePaymentDto);
                if (!result)
                {
                    return NotFound($"Payment with ID {id} not found.");
                }
                
                // Update debt information after payment update
                _debtService.UpdateDebtFromInvoice(updatePaymentDto.InvoiceId);
                
                return Ok(new { message = "Payment updated successfully." });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Error updating payment: {ex.Message}" });
            }
        }

        [HttpDelete("{id}")]
        public ActionResult<bool> DeletePayment(int id)
        {
            // Get the payment first to know which invoice to update
            var payment = _paymentService.GetPaymentById(id);
            if (payment == null)
            {
                return NotFound($"Payment with ID {id} not found.");
            }
            
            var result = _paymentService.DeletePayment(id);
            if (!result)
            {
                return NotFound($"Payment with ID {id} not found.");
            }
            
            // Update debt information after payment deletion
            _debtService.UpdateDebtFromInvoice(payment.InvoiceId);
            
            return Ok(new { message = "Payment deleted successfully." });
        }
    }
} 