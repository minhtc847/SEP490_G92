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

        public FormularDto CreateFormular(CreateFormularRequest request)
        {
            var product = _context.Products.FirstOrDefault(p => p.Id == request.ProductId);
            if (product == null)
            {
                throw new ArgumentException("Invalid ProductId");
            }

            var entity = new Formular
            {
                Type = request.Type,
                Ratio = request.Ratio,
                Description = request.Description,
                ProductId = request.ProductId
            };

            _context.Formulars.Add(entity);
            _context.SaveChanges();

            return new FormularDto
            {
                Id = entity.Id,
                Type = entity.Type,
                ChemicalName = product.ProductName ?? string.Empty,
                Ratio = entity.Ratio,
                Description = entity.Description,
                ProductId = entity.ProductId
            };
        }

        public FormularDto UpdateFormular(int id, UpdateFormularRequest request)
        {
            var entity = _context.Formulars.Include(f => f.Product).FirstOrDefault(f => f.Id == id);
            if (entity == null)
            {
                throw new ArgumentException("Formular not found");
            }

            var product = _context.Products.FirstOrDefault(p => p.Id == request.ProductId);
            if (product == null)
            {
                throw new ArgumentException("Invalid ProductId");
            }

            entity.ProductId = request.ProductId;
            entity.Ratio = request.Ratio;
            entity.Description = request.Description;

            _context.SaveChanges();

            return new FormularDto
            {
                Id = entity.Id,
                Type = entity.Type,
                ChemicalName = product.ProductName ?? string.Empty,
                Ratio = entity.Ratio,
                Description = entity.Description,
                ProductId = entity.ProductId
            };
        }

        public void DeleteFormular(int id)
        {
            var entity = _context.Formulars.FirstOrDefault(f => f.Id == id);
            if (entity == null)
            {
                throw new ArgumentException("Formular not found");
            }

            _context.Formulars.Remove(entity);
            _context.SaveChanges();
        }

    }
} 