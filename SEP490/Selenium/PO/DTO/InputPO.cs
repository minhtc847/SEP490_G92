using SEP490.Selenium.SaleOrder.DTO;

namespace SEP490.Selenium.PO.DTO
{
    public class InputPO
    {
        public string supplierName { get; set; }
        public string date { get; set; }
        public List<SaleOrderProductsInput> ProductsInput { get; set; }
    }
}
