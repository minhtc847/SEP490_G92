namespace SEP490.Selenium.ProductionOrder.DTO
{
    public class ProductionOrderInput
    {
        public string SaleOrderCode { get; set; }
        public List<OutputProducts> OutputProducts { get; set; }
    }
}
