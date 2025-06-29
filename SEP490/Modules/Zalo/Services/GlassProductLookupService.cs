using SEP490.DB;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using SEP490.Common.Services;

namespace SEP490.Modules.Zalo.Services
{
    public class GlassProductLookupService : BaseService,IGlassProductLookupService
    {
        private readonly SEP490DbContext _context;

        public GlassProductLookupService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<string?> FindProductCodeAsync(string itemCode, string itemType, double height, double width, double thickness)
        {
            // 1. Tìm glassstructureId
            var glassStructure = await _context.GlassStructures
                .FirstOrDefaultAsync(gs => gs.ProductCode == itemCode && gs.Category =="VNG-"+ itemType);

            if (glassStructure == null)
                return null;

            // 2. Tìm productcode trong b?ng Product
            var product = await _context.Products
                .FirstOrDefaultAsync(p =>
                    p.GlassStructureId == glassStructure.Id &&
                    p.Height == height.ToString() && // Convert height to string for comparison
                    p.Width == width.ToString() &&  // Convert width to string for comparison
                    p.Thickness == (decimal)thickness); // Cast thickness to decimal for comparison

            return product?.ProductCode;
        }
    }
}