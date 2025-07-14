using Microsoft.EntityFrameworkCore;
using OpenQA.Selenium.DevTools.V135.Browser;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.GlueButylExport.DTO;

namespace SEP490.Modules.GlueButylExport.Services
{
    public class GlueButylExportService : BaseService, IGlueButylExportService
    {
        private readonly SEP490DbContext _context;
        public GlueButylExportService(SEP490DbContext context)
        {
            _context = context;
        }
        public async Task AddGlueButylExport(CreateNewDTO createNewDTO)
        {
            ProductionPlan productionPlan = await _context.ProductionPlans.FindAsync(createNewDTO.ProductionPlanId);
            if (productionPlan == null)
            {
                throw new Exception("Production plan not found.");
            }
            GlueButylExportInvoice invoice = new GlueButylExportInvoice
            {
                ProductionPlanId = createNewDTO.ProductionPlanId,
                Products = createNewDTO.Products,
                EmployeeId = createNewDTO.EmployeeId,
                Note = createNewDTO.Note,
                GlueButyls = createNewDTO.GlueButyls
            };
            _context.GlueButylExportInvoices.Add(invoice);
            _context.SaveChanges();
        }
        public async Task<List<GlueButylExportResponseDTO>> getAllExportByProductionPlanId(int productionPlanId)
        {
            var exports = await _context.GlueButylExportInvoices
                .Where(x => x.ProductionPlanId == productionPlanId)
                .Include(x => x.Employee)
                .ToListAsync();

            return exports.Select(x => new GlueButylExportResponseDTO
            {
                Id = x.Id,
                CreatedAt = x.CreatedAt,
                EmployeeName = x.Employee?.FullName,
                Note = x.Note,
                Products = x.Products,
                GlueButyls = x.GlueButyls,
                ProductionPlanId = x.ProductionPlanId
            }).ToList();
        }

        public async Task<GlueButylExportResponseDTO> GetExportById(int id)
        {
            var export = await _context.GlueButylExportInvoices
                .Include(x => x.Employee)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (export == null)
            {
                throw new Exception("Glue Butyl Export not found.");
            }

            return new GlueButylExportResponseDTO
            {
                Id = export.Id,
                CreatedAt = export.CreatedAt,
                EmployeeName = export.Employee?.FullName,
                Note = export.Note,
                Products = export.Products,
                GlueButyls = export.GlueButyls,
                ProductionPlanId = export.ProductionPlanId
            };
        }
    }
}
