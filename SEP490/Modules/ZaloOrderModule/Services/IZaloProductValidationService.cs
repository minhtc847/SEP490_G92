using SEP490.Modules.ZaloOrderModule.DTO;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public interface IZaloProductValidationService
    {
        /// <summary>
        /// Validates single product input format: "Mã sản phẩm + Loại sản phẩm + Kích thước + Số lượng"
        /// Example: "EI90 MB 1000*2000*25mm 2"
        /// </summary>
        /// <param name="productInput">The product input string to validate</param>
        /// <returns>Validation result with parsed product information</returns>
        Task<ProductValidationResult> ValidateProductInputAsync(string productInput);

        /// <summary>
        /// Validates multiple products input format, separated by comma, semicolon or newline
        /// Example: "EI90 MB 1000*2000*25mm 2, ABC123 XYZ 500*1000*10mm 5"
        /// </summary>
        /// <param name="productsInput">The products input string to validate</param>
        /// <returns>Validation result with parsed products information</returns>
        Task<MultipleProductsValidationResult> ValidateMultipleProductsInputAsync(string productsInput);
    }

    public class ProductValidationResult
    {
        public bool IsValid { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string ProductType { get; set; } = string.Empty;
        public string Dimensions { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string OriginalInput { get; set; } = string.Empty;
    }

    public class MultipleProductsValidationResult
    {
        public bool IsValid { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public List<ProductValidationResult> ValidProducts { get; set; } = new List<ProductValidationResult>();
        public List<ProductValidationResult> InvalidProducts { get; set; } = new List<ProductValidationResult>();
        public string OriginalInput { get; set; } = string.Empty;
        public int TotalProducts { get; set; }
        public int ValidCount { get; set; }
        public int InvalidCount { get; set; }
    }
}
