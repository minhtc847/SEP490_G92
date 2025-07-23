using Microsoft.EntityFrameworkCore;
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
            var productionOrder = await _context.ProductionOrders.FindAsync(createNewDTO.ProductionOrderId)
                ?? throw new Exception("Production order not found.");

            var invoice = new GlueButylExportInvoice
            {
                ProductionOrderId = createNewDTO.ProductionOrderId,
                Products = createNewDTO.Products,
                EmployeeId = createNewDTO.EmployeeId,
                Note = createNewDTO.Note
            };
            foreach (var product in createNewDTO.Products)
            {
                if (product.Quantity >0)
                {
                    var productionOutput = await _context.ProductionOutputs
                        .FirstOrDefaultAsync(x => x.ProductName == product.Name && x.ProductionOrderId == createNewDTO.ProductionOrderId);
                    if (productionOutput != null)
                    {
                        //productionOutput.Done += product.Quantity;
                    }
                    else
                    {
                        throw new Exception($"Production output for product {product.Name} not found.");
                    }
                    _context.ProductionOutputs.Update(productionOutput);
                }
            }
            _context.GlueButylExportInvoices.Add(invoice);
            await _context.SaveChangesAsync();
        }

        public async Task<List<GlueButylExportResponseDTO>> getAllExportByProductionOrderId(int productionOrderId)
        {
            var exports = await _context.GlueButylExportInvoices
                .Where(x => x.ProductionOrderId == productionOrderId)
                .Include(x => x.Employee)
                .ToListAsync();

            return exports.Select(x => new GlueButylExportResponseDTO
            {
                Id = x.Id,
                CreatedAt = x.CreatedAt,
                EmployeeName = x.Employee?.FullName,
                Note = x.Note,
                Products = x.Products,
                ProductionOrderId = x.ProductionOrderId ?? 0
            }).ToList();
        }

        public async Task<GlueButylExportResponseDTO> GetExportById(int id)
        {
            var export = await _context.GlueButylExportInvoices
                .Include(x => x.Employee)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (export == null)
                throw new Exception("Glue Butyl Export not found.");

            return new GlueButylExportResponseDTO
            {
                Id = export.Id,
                CreatedAt = export.CreatedAt,
                EmployeeName = export.Employee?.FullName,
                Note = export.Note,
                Products = export.Products,
                ProductionOrderId = export.ProductionOrderId ?? 0
            };
        }
    }
}
