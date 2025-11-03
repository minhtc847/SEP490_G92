using SEP490.Modules.Debts.DTO;

namespace SEP490.Modules.Debts.Service
{
    public interface IDebtService
    {
        List<DebtDto> GetAllDebts();
        DebtDto? GetDebtByCustomerId(int customerId);
        DebtSummaryDto GetDebtSummary();
        void UpdateDebtFromInvoice(int invoiceId);
        void UpdateAllDebts();
        List<DebtDto> GetDebtsByFilter(string? customerName, int? debtType, decimal? minAmount, decimal? maxAmount);
    }
} 