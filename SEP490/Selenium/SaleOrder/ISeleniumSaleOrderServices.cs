using SEP490.Selenium.SaleOrder.DTO;

namespace SEP490.Selenium.SaleOrder
{
    public interface ISeleniumSaleOrderServices
    {
        public string OpenSaleOrderPage(SaleOrderInput saleOrderInput);
    }
}
