using SEP490.Selenium.Product.DTO;

namespace SEP490.Selenium.Product
{
    public interface IMisaProductService
    {
        string AddProduct(InputSingleProduct input);
        void updateProduct(InputUpdateProduct input);
    }
}
