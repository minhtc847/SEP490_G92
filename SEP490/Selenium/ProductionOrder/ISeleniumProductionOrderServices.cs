using SEP490.Selenium.ProductionOrder.DTO;

namespace SEP490.Selenium.ProductionOrder
{
    public interface ISeleniumProductionOrderServices
    {
        public void OpenProductionOrderPage(ProductionOrderInput input);
    }
}
