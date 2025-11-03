using SEP490.DB.Models;
using SEP490.Modules.ProductModule.DTO;

namespace SEP490.Modules.ProductModule.Service
{
    public interface IProductService
    {
        List<ProductDto> GetAllProducts();
        void CreateProduct(CreateProductProductDto dto);
        bool DeleteProduct(int id);
        Product? GetProductById(int id);
        ProductDetailDto? GetProductDetailById(int id);
        bool UpdateProduct(int id, UpdateProductProductDto dto);
    }
}
