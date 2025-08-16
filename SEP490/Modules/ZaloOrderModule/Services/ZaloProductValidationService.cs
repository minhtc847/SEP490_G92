using Microsoft.Extensions.Logging;
using SEP490.Common.Services;
using System.Text.RegularExpressions;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public class ZaloProductValidationService : BaseTransientService, IZaloProductValidationService
    {
        private readonly ILogger<ZaloProductValidationService> _logger;

        public ZaloProductValidationService(ILogger<ZaloProductValidationService> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Validates single product input format: "Mã sản phẩm + Loại sản phẩm + Kích thước + Số lượng"
        /// Example: "EI90 MB 1000*2000*25mm 2"
        /// </summary>
        /// <param name="productInput">The product input string to validate</param>
        /// <returns>Validation result with parsed product information</returns>
        public async Task<ProductValidationResult> ValidateProductInputAsync(string productInput)
        {
            try
            {
                _logger.LogInformation("Validating product input: {ProductInput}", productInput);

                var result = new ProductValidationResult
                {
                    OriginalInput = productInput,
                    IsValid = false
                };

                if (string.IsNullOrWhiteSpace(productInput))
                {
                    result.ErrorMessage = "Thông tin sản phẩm không được để trống.";
                    return result;
                }

                // Trim and normalize spaces
                var normalizedInput = Regex.Replace(productInput.Trim(), @"\s+", " ");
                var parts = normalizedInput.Split(' ');

                // Check if we have exactly 4 parts
                if (parts.Length != 4)
                {
                    result.ErrorMessage = "Thông tin sản phẩm phải có đúng 4 phần: Mã sản phẩm + Loại sản phẩm + Kích thước + Số lượng";
                    return result;
                }

                // Extract parts
                var productCode = parts[0];
                var productType = parts[1];
                var dimensions = parts[2];
                var quantityStr = parts[3];

                // Validate product code (alphanumeric, at least 2 characters)
                if (!IsValidProductCode(productCode))
                {
                    result.ErrorMessage = "Mã sản phẩm không hợp lệ. Mã sản phẩm phải chứa ít nhất 2 ký tự chữ và số.";
                    return result;
                }

                // Validate product type (letters only, 1-2 characters)
                if (!IsValidProductType(productType))
                {
                    result.ErrorMessage = "Loại sản phẩm không hợp lệ. Loại sản phẩm chỉ được chứa chữ cái (1-2 ký tự).";
                    return result;
                }

                // Validate dimensions format (e.g., 1000*2000*25mm)
                if (!IsValidDimensions(dimensions))
                {
                    result.ErrorMessage = "Kích thước không hợp lệ. Định dạng phải là: Chiều rộng*Chiều cao*Độ dày (VD: 1000*2000*25mm)";
                    return result;
                }

                // Validate quantity (positive integer)
                if (!int.TryParse(quantityStr, out int quantity) || quantity <= 0)
                {
                    result.ErrorMessage = "Số lượng không hợp lệ. Số lượng phải là số nguyên dương.";
                    return result;
                }

                // All validations passed
                result.IsValid = true;
                result.ProductCode = productCode;
                result.ProductType = productType;
                result.Dimensions = dimensions;
                result.Quantity = quantity;

                _logger.LogInformation("Product validation successful: Code={ProductCode}, Type={ProductType}, Dimensions={Dimensions}, Quantity={Quantity}",
                    productCode, productType, dimensions, quantity);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating product input: {ProductInput}", productInput);
                return new ProductValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Có lỗi xảy ra khi xử lý thông tin sản phẩm. Vui lòng thử lại.",
                    OriginalInput = productInput
                };
            }
        }

        /// <summary>
        /// Validates product code format
        /// </summary>
        /// <param name="productCode">Product code to validate</param>
        /// <returns>True if valid, false otherwise</returns>
        private bool IsValidProductCode(string productCode)
        {
            if (string.IsNullOrWhiteSpace(productCode) || productCode.Length < 2)
                return false;

            // Product code should contain alphanumeric characters
            return Regex.IsMatch(productCode, @"^[a-zA-Z0-9]+$");
        }

        /// <summary>
        /// Validates product type format
        /// </summary>
        /// <param name="productType">Product type to validate</param>
        /// <returns>True if valid, false otherwise</returns>
        private bool IsValidProductType(string productType)
        {
            if (string.IsNullOrWhiteSpace(productType) || productType.Length > 2)
                return false;

            // Product type should contain only letters
            return Regex.IsMatch(productType, @"^[a-zA-Z]+$");
        }

        /// <summary>
        /// Validates dimensions format (e.g., 1000*2000*25mm)
        /// </summary>
        /// <param name="dimensions">Dimensions string to validate</param>
        /// <returns>True if valid, false otherwise</returns>
        private bool IsValidDimensions(string dimensions)
        {
            if (string.IsNullOrWhiteSpace(dimensions))
                return false;

            // Pattern: number*number*numbermm
            var pattern = @"^(\d+)\*(\d+)\*(\d+)$";
            var match = Regex.Match(dimensions, pattern);

            if (!match.Success)
                return false;

            // Extract and validate individual dimensions
            if (!int.TryParse(match.Groups[1].Value, out int width) || width <= 0)
                return false;

            if (!int.TryParse(match.Groups[2].Value, out int height) || height <= 0)
                return false;

            if (!int.TryParse(match.Groups[3].Value, out int thickness) || thickness <= 0)
                return false;

            // Additional business logic validation
            if (width > 10000 || height > 10000 || thickness > 100)
            {
                return false; // Dimensions too large
            }

            return true;
        }

        /// <summary>
        /// Validates multiple products input format, separated by comma, semicolon or newline
        /// Example: "EI90 MB 1000*2000*25mm 2, ABC123 XYZ 500*1000*10mm 5"
        /// </summary>
        /// <param name="productsInput">The products input string to validate</param>
        /// <returns>Validation result with parsed products information</returns>
        public async Task<MultipleProductsValidationResult> ValidateMultipleProductsInputAsync(string productsInput)
        {
            try
            {
                _logger.LogInformation("Validating multiple products input: {ProductsInput}", productsInput);

                var result = new MultipleProductsValidationResult
                {
                    OriginalInput = productsInput,
                    IsValid = false
                };

                if (string.IsNullOrWhiteSpace(productsInput))
                {
                    result.ErrorMessage = "Thông tin sản phẩm không được để trống.";
                    return result;
                }

                // Split by comma, semicolon, or newline
                var productStrings = SplitProductsInput(productsInput);
                result.TotalProducts = productStrings.Count;

                if (result.TotalProducts == 0)
                {
                    result.ErrorMessage = "Không tìm thấy thông tin sản phẩm nào.";
                    return result;
                }

                // Validate each product
                foreach (var productString in productStrings)
                {
                    var trimmedProduct = productString.Trim();
                    if (string.IsNullOrWhiteSpace(trimmedProduct))
                        continue;

                    var singleResult = await ValidateProductInputAsync(trimmedProduct);
                    singleResult.OriginalInput = trimmedProduct;

                    if (singleResult.IsValid)
                    {
                        result.ValidProducts.Add(singleResult);
                    }
                    else
                    {
                        result.InvalidProducts.Add(singleResult);
                    }
                }

                result.ValidCount = result.ValidProducts.Count;
                result.InvalidCount = result.InvalidProducts.Count;

                // Determine overall validity
                if (result.ValidCount == 0)
                {
                    result.ErrorMessage = "Không có sản phẩm nào hợp lệ. Vui lòng kiểm tra lại định dạng.";
                }
                else if (result.InvalidCount > 0)
                {
                    result.IsValid = true; // Partial success
                    result.ErrorMessage = GeneratePartialSuccessMessage(result);
                }
                else
                {
                    result.IsValid = true; // All products valid
                }

                _logger.LogInformation("Multiple products validation completed: {ValidCount}/{TotalCount} valid",
                    result.ValidCount, result.TotalProducts);

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating multiple products input: {ProductsInput}", productsInput);
                return new MultipleProductsValidationResult
                {
                    IsValid = false,
                    ErrorMessage = "Có lỗi xảy ra khi xử lý thông tin sản phẩm. Vui lòng thử lại.",
                    OriginalInput = productsInput
                };
            }
        }

        /// <summary>
        /// Splits products input by comma, semicolon, or newline
        /// </summary>
        /// <param name="productsInput">The products input string</param>
        /// <returns>List of individual product strings</returns>
        private List<string> SplitProductsInput(string productsInput)
        {
            // Split by comma, semicolon, or newline (including \r\n, \r, \n)
            var separators = new[] { ',', ';', '\r', '\n' };
            var products = productsInput.Split(separators, StringSplitOptions.RemoveEmptyEntries)
                                       .Select(p => p.Trim())
                                       .Where(p => !string.IsNullOrWhiteSpace(p))
                                       .ToList();

            return products;
        }

        /// <summary>
        /// Generates a message for partial success (some products valid, some invalid)
        /// </summary>
        /// <param name="result">The validation result</param>
        /// <returns>Formatted message</returns>
        private string GeneratePartialSuccessMessage(MultipleProductsValidationResult result)
        {
            var message = $"✅ Đã xác thực {result.ValidCount}/{result.TotalProducts} sản phẩm thành công.\n\n";

            if (result.InvalidProducts.Count > 0)
            {
                message += "❌ Các sản phẩm không hợp lệ:\n";
                for (int i = 0; i < result.InvalidProducts.Count; i++)
                {
                    var invalidProduct = result.InvalidProducts[i];
                    message += $"{i + 1}. \"{invalidProduct.OriginalInput}\" - {invalidProduct.ErrorMessage}\n";
                }
                message += "\n💡 Vui lòng sửa lại các sản phẩm không hợp lệ hoặc bỏ qua chúng.";
            }

            return message;
        }
    }
}
