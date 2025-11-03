using SEP490.Modules.ZaloOrderModule.DTO;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public interface IZaloPriceCalculationService
    {
        /// <summary>
        /// Tính đơn giá cho một sản phẩm dựa trên ProductCode, ProductType và kích thước
        /// </summary>
        /// <param name="productCode">Mã sản phẩm (ví dụ: "120")</param>
        /// <param name="productType">Loại sản phẩm (ví dụ: "MB-EI")</param>
        /// <param name="width">Chiều rộng (mm)</param>
        /// <param name="height">Chiều cao (mm)</param>
        /// <returns>Đơn giá tính theo m²</returns>
        Task<decimal> CalculateUnitPriceAsync(string productCode, string productType, float width, float height);
    }
}
