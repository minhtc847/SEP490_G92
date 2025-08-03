using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.Debts.DTO;
using SEP490.Modules.Debts.Service;

namespace SEP490.Modules.Debts.Controller
{
    [Route("api/debts")]
    [ApiController]
    public class DebtController : ControllerBase
    {
        private readonly IDebtService _debtService;

        public DebtController(IDebtService debtService)
        {
            _debtService = debtService;
        }

        [HttpGet]
        public ActionResult<List<DebtDto>> GetAllDebts()
        {
            var debts = _debtService.GetAllDebts();
            return Ok(debts);
        }

        [HttpGet("summary")]
        public ActionResult<DebtSummaryDto> GetDebtSummary()
        {
            var summary = _debtService.GetDebtSummary();
            return Ok(summary);
        }

        [HttpGet("customer/{customerId}")]
        public ActionResult<DebtDto> GetDebtByCustomerId(int customerId)
        {
            var debt = _debtService.GetDebtByCustomerId(customerId);
            if (debt == null)
            {
                return NotFound($"No debt found for customer with ID {customerId}.");
            }
            return Ok(debt);
        }

        [HttpGet("filter")]
        public ActionResult<List<DebtDto>> GetDebtsByFilter(
            [FromQuery] string? customerName,
            [FromQuery] int? debtType,
            [FromQuery] decimal? minAmount,
            [FromQuery] decimal? maxAmount)
        {
            var debts = _debtService.GetDebtsByFilter(customerName, debtType, minAmount, maxAmount);
            return Ok(debts);
        }

        [HttpPost("update/{invoiceId}")]
        public ActionResult UpdateDebtFromInvoice(int invoiceId)
        {
            try
            {
                _debtService.UpdateDebtFromInvoice(invoiceId);
                return Ok(new { message = "Debt updated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Error updating debt: {ex.Message}" });
            }
        }

        [HttpPost("update-all")]
        public ActionResult UpdateAllDebts()
        {
            try
            {
                _debtService.UpdateAllDebts();
                return Ok(new { message = "All debts updated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Error updating debts: {ex.Message}" });
            }
        }
    }
} 