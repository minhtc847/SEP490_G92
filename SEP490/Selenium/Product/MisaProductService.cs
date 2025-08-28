using OpenQA.Selenium.Support.UI;
using OpenQA.Selenium;
using SEP490.Common.Services;
using OpenQA.Selenium.Chrome;
using SEP490.Selenium.Product.DTO;
using SEP490.Selenium.ProductionOrder.DTO;
using OpenQA.Selenium.DevTools.V135.Autofill;

namespace SEP490.Selenium.Product
{
    public class MisaProductService : SeleniumService, IMisaProductService
    {
        public MisaProductService(IConfiguration configuration)
            : base(configuration, "https://actapp.misa.vn/app/IN/INInventoryItems")
        {
        }
    //    
        public void AddProduct(InputSingleProduct input)
        {
            InitSelenium();
            Login();
            Thread.Sleep(3000); // Wait for the page to load
            
            ClickIfExists(
                By.XPath("//div[contains(@class, 'ms-button-text') and contains(text(), 'Thêm')]"),
                driver,
                wait
                );
            Thread.Sleep(500); // Wait for the modal to open
            AddField(input);
            CloseDriver();
        }
        public void AddField(InputSingleProduct input)
        {
            var hangHoaElement = wait.Until(d => d.FindElement(By.XPath("//div[@class='item-title']/div[text()='"+input.Type+"']")));
            hangHoaElement.Click();
            Thread.Sleep(500); // Wait for the dropdown to open
            var tenInput = wait.Until(d => d.FindElement(By.XPath("//div[text()='Tên']/ancestor::div[contains(@class,'ms-editor')]//input[@type='text']")));
            tenInput.SendKeys(input.Name);
            Thread.Sleep(500); // Wait for the input to be filled
            var donViTinhInput = wait.Until(driver =>
    driver.FindElement(By.XPath("//div[text()='Đơn vị tính chính']/ancestor::div[contains(@class,'ms-combo-box')]//input[@class='combo-input']"))
);
            donViTinhInput.SendKeys(input.Unit);
            Thread.Sleep(500);
            var catVaThemButton = wait.Until(driver =>
    driver.FindElement(By.XPath("//div[text()='Cất và Thêm']/ancestor::button"))
);
            catVaThemButton.Click();
            Thread.Sleep(1500); // Wait for the action to complete
        }
        
    }

}
