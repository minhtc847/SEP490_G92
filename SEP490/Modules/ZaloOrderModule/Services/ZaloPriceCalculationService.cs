using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public class ZaloPriceCalculationService : BaseService, IZaloPriceCalculationService
    {
        private readonly ILogger<ZaloPriceCalculationService> _logger;
        private readonly SEP490DbContext _context;

        public ZaloPriceCalculationService(
            ILogger<ZaloPriceCalculationService> logger,
            SEP490DbContext context)
        {
            _logger = logger;
            _context = context;
        }

        public async Task<decimal> CalculateUnitPriceAsync(string productCode, string productType, float width, float height)
        {
            try
            {
                // Tạo product_code để tìm kiếm trong database
                // Format: {ProductType}-{ProductCode} (ví dụ: "MB-EI-120")
                var searchProductCode = $"{productType}-{productCode}";

                _logger.LogInformation("Searching for product code: {SearchProductCode}", searchProductCode);

                // Tìm kiếm trong bảng GlassStructure
                var glassStructure = await _context.GlassStructures
                    .FirstOrDefaultAsync(g => g.ProductCode == searchProductCode);

                if (glassStructure == null)
                {
                    _logger.LogWarning("Glass structure not found for product code: {SearchProductCode}", searchProductCode);
                    return 0; // Trả về 0 nếu không tìm thấy
                }

                if (!glassStructure.UnitPrice.HasValue || glassStructure.UnitPrice.Value <= 0)
                {
                    _logger.LogWarning("Unit price is null or zero for product code: {SearchProductCode}", searchProductCode);
                    return 0;
                }

                // Tính diện tích (m²)
                var areaInSquareMeters = (width * height) / 1000000; // Chuyển từ mm² sang m²

                // Tính đơn giá = unit_price * diện tích
                var unitPrice = glassStructure.UnitPrice.Value * (decimal)areaInSquareMeters;

                _logger.LogInformation("Calculated unit price for {ProductCode}: {UnitPrice} (base price: {BasePrice}, area: {Area}m²)", 
                    searchProductCode, unitPrice, glassStructure.UnitPrice.Value, areaInSquareMeters);

                return unitPrice;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating unit price for product code: {ProductCode}, product type: {ProductType}", 
                    productCode, productType);
                return 0;
            }
        }
    }
}
