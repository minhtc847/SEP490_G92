using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.GlassStructureModule.DTO;

namespace SEP490.Modules.GlassStructureModule.Service
{
    public class GlassStructureService : BaseScopedService, IGlassStructureService
    {
        private readonly SEP490DbContext _context;

        public GlassStructureService(SEP490DbContext context)
        {
            _context = context;
        }

        public List<GlassStructureDto> GetAllGlassStructures()
        {
            return _context.GlassStructures.Select(g => new GlassStructureDto
            {
                Id = g.Id,
                ProductCode = g.ProductCode,
                ProductName = g.ProductName,
                Category = g.Category,
                EdgeType = g.EdgeType,
                AdhesiveType = g.AdhesiveType,
                GlassLayers = g.GlassLayers,
                AdhesiveLayers = g.AdhesiveLayers,
                AdhesiveThickness = g.AdhesiveThickness,
                UnitPrice = g.UnitPrice,
                Composition = g.Composition
            }).ToList();
        }

        public GlassStructureDto? GetGlassStructureById(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Invalid GlassStructure ID");
            var g = _context.GlassStructures.FirstOrDefault(x => x.Id == id);
            if (g == null) 
                throw new ArgumentException("GlassStructure not found");

            return new GlassStructureDto
            {
                Id = g.Id,
                ProductCode = g.ProductCode,
                ProductName = g.ProductName,
                Category = g.Category,
                EdgeType = g.EdgeType,
                AdhesiveType = g.AdhesiveType,
                GlassLayers = g.GlassLayers,
                AdhesiveLayers = g.AdhesiveLayers,
                AdhesiveThickness = g.AdhesiveThickness,
                UnitPrice = g.UnitPrice,
                Composition = g.Composition
            };
        }

        public async Task<bool> UpdateGlassStructureById(int id, UpdateGlassStructureDto dto)
        {
            var glass = await _context.GlassStructures.FirstOrDefaultAsync(g => g.Id == id);
            if (glass == null) return false;

            if (id <= 0)
                throw new ArgumentException("Invalid ID");

            if (dto.ProductName == null)
                throw new ArgumentException("ProductName is required");

            if (dto.ProductCode == null)
                throw new ArgumentException("ProductCode is required");

            if (dto.Category == null)
                throw new ArgumentException("Category is required");

            if (dto.UnitPrice < 0)
                throw new ArgumentException("UnitPrice must be non-negative");

            var isDuplicateName = await _context.GlassStructures
                .AnyAsync(g => g.ProductName == dto.ProductName && g.Id != id);
            if (isDuplicateName)
                throw new ArgumentException("Duplicate ProductName");

            glass.ProductCode = dto.ProductCode;
            glass.ProductName = dto.ProductName;
            glass.Category = dto.Category;
            glass.EdgeType = dto.EdgeType;
            glass.AdhesiveType = dto.AdhesiveType;
            glass.GlassLayers = dto.GlassLayers;
            glass.AdhesiveLayers = dto.AdhesiveLayers;
            glass.AdhesiveThickness = dto.AdhesiveThickness;
            glass.UnitPrice = dto.UnitPrice;
            glass.Composition = dto.Composition;

            await _context.SaveChangesAsync();
            return true;
        }



        public GlassStructureDto AddGlassStructure(UpdateGlassStructureDto dto)
        {
            var newGlass = new GlassStructure
            {
                ProductCode = dto.ProductCode,
                ProductName = dto.ProductName,
                Category = dto.Category,
                EdgeType = dto.EdgeType,
                AdhesiveType = dto.AdhesiveType,
                GlassLayers = dto.GlassLayers,
                AdhesiveLayers = dto.AdhesiveLayers,
                AdhesiveThickness = dto.AdhesiveThickness,
                UnitPrice = dto.UnitPrice,
                Composition = dto.Composition
            };

            _context.GlassStructures.Add(newGlass);
            _context.SaveChanges();

            return new GlassStructureDto
            {
                Id = newGlass.Id,
                ProductCode = newGlass.ProductCode,
                ProductName = newGlass.ProductName,
                Category = newGlass.Category,
                EdgeType = newGlass.EdgeType,
                AdhesiveType = newGlass.AdhesiveType,
                GlassLayers = newGlass.GlassLayers,
                AdhesiveLayers = newGlass.AdhesiveLayers,
                AdhesiveThickness = newGlass.AdhesiveThickness,
                UnitPrice = newGlass.UnitPrice,
                Composition = newGlass.Composition
            };
        }


        public bool DeleteGlassStructureById(int id)
        {
            var glass = _context.GlassStructures.FirstOrDefault(g => g.Id == id);
            if (glass == null) return false;

            if (id <= 0)
            {
                throw new ArgumentException("Invalid ID");
            }

            var glassStructure = _context.GlassStructures.FindAsync(id);
            if (glassStructure == null)
            {
                throw new ArgumentException("GlassStructure not found");
            }

            bool hasLinkedProducts = _context.Products.Any(p => p.GlassStructureId == id);
            if (hasLinkedProducts)
            {
                throw new InvalidOperationException("Không thể xoá vì đang được sử dụng bởi sản phẩm.");
            }

            _context.GlassStructures.Remove(glass);
            _context.SaveChanges();
            return true;
        }

    }
}
