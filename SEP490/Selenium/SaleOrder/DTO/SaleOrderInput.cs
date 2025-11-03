namespace SEP490.Selenium.SaleOrder.DTO
{
    public class SaleOrderInput
    {
        public int Id { get; set; }
        public string CustomerCode { get; set; }
        public List<SaleOrderProductsInput> ProductsInput { get; set; }
    }
}
