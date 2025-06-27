namespace SEP490.Selenium.ProductionOrder.DTO
{
    public class OutputProducts
    {
        public string OutputProductCode { get; set; }
        public int OutputProductQuantity { get; set; }
        public List<InputProduct> InputProducts { get; set; }
    }
}
