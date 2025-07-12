using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class ExportInvoiceService : BaseService, IExportInvoiceService
    {
        private readonly SEP490DbContext _context;

        public ExportInvoiceService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<List<ExportInvoiceDto>> GetExportInvoicesByProductionPlanIdAsync(int productionPlanId)
        {
            var exportInvoices = await _context.ExportInvoices
                .Include(ei => ei.ProductionOrder)
                .Where(ei => ei.ProductionOrder.ProductionPlanId == productionPlanId)
                .Select(ei => new ExportInvoiceDto
                {
                    Id = ei.Id,
                    EmployeeName = ei.EmployeeName,
                    ExportDate = ei.ExportDate,
                    Note = ei.Note,
                    Status = ei.Status,
                    TotalAmount = ei.TotalAmount,
                    ProductionOrderId = ei.ProductionOrderId
                })
                .ToListAsync();

            return exportInvoices;
        }
    }
} 