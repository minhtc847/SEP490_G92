using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface IExportInvoiceService
    {
        Task<List<ExportInvoiceDto>> GetExportInvoicesByProductionPlanIdAsync(int productionPlanId);
    }
} 