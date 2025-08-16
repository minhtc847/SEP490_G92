using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.FormularModule.DTO;

namespace SEP490.Modules.FormularModule.Services
{
    public class FormularService : BaseScopedService, IFormularService
    {
        private readonly SEP490DbContext _context;

        public FormularService(SEP490DbContext context)
        {
            _context = context;
        }

        public List<FormularGroupDto> GetAllFormularsGroupedByType()
        {
            var formulars = _context.Formulars
                .Include(f => f.Product)
                .ToList();

            var groupedFormulars = formulars
                .GroupBy(f => f.Type)
                .Select(group => new FormularGroupDto
                {
                    Type = group.Key,
                    Formulars = group.Select(f => new FormularDto
                    {
                        Id = f.Id,
                        Type = f.Type,
                        ChemicalName = f.Product?.ProductName,
                        Ratio = f.Ratio,
                        Description = f.Description,
                        ProductId = f.ProductId,
                    }).ToList()
                })
                .ToList();

            return groupedFormulars;
        }

        public List<FormularDto> GetFormularsByType(string type)
        {
            var formulars = _context.Formulars
                .Include(f => f.Product)
                .Where(f => f.Type == type)
                .Select(f => new FormularDto
                {
                    Id = f.Id,
                    Type = f.Type,
                    ChemicalName = f.Product.ProductName,
                    Ratio = f.Ratio,
                    Description = f.Description,
                    ProductId = f.ProductId,
                })
                .ToList();

            return formulars;
        }

    }
} 