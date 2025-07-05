using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.GlassStructureModule.ManageGlassStructure.DTO;

namespace SEP490.Modules.GlassStructureModule.ManageGlassStructure.Service
{
    public class GlassStructureService : BaseService, IGlassStructureService
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
            var g = _context.GlassStructures.FirstOrDefault(x => x.Id == id);
            if (g == null) return null;

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

        public bool UpdateGlassStructureById(int id, UpdateGlassStructureDto dto)
        {
            var glass = _context.GlassStructures.FirstOrDefault(g => g.Id == id);
            if (glass == null) return false;

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

            _context.SaveChanges();
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
