using OpenQA.Selenium.Support.UI;
using OpenQA.Selenium;
using SEP490.Common.Services;
using OpenQA.Selenium.Chrome;
using SEP490.Selenium.Product.DTO;
using SEP490.Selenium.ProductionOrder.DTO;
using OpenQA.Selenium.DevTools.V135.Autofill;

namespace SEP490.Selenium.Product
{
    public class MisaProductService : BaseService, IMisaProductService
    {
        private IWebDriver driver;
        private string URL = "https://actapp.misa.vn/app/IN/INInventoryItems";
        private WebDriverWait wait;
        private readonly IConfiguration _config;
        public MisaProductService(IConfiguration configuration)
        {
            _config = configuration;
        }
        private void InitSelenium()
        {
            driver = new ChromeDriver();
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            driver.Navigate().GoToUrl(URL);
        }
        private void Login()
        {
            Thread.Sleep(500); // Wait for the page to load
            IWebElement emailInput = wait.Until(drv => drv.FindElement(By.Name("username")));
            emailInput.SendKeys(_config["Misa:Username"]);
            IWebElement passwordInput = wait.Until(drv => drv.FindElement(By.Name("pass")));
            passwordInput.SendKeys(_config["Misa:Password"]);
            IWebElement loginButton = driver.FindElement(By.CssSelector("#box-login-right > div > div > div.login-form-basic-container > div > div.login-form-btn-container.login-class > button"));
            loginButton.Click();
            Thread.Sleep(500);
        }
        private void CloseDriver()
        {
            if (driver != null)
            {
                driver.Close();
                driver.Quit();
            }
        }
        public void AddProduct(InputSingleProduct input)
        {
            InitSelenium();
            Login();
            Thread.Sleep(5000); // Wait for the page to load
            var button = wait.Until(drv => drv.FindElement(By.XPath("//div[contains(@class, 'ms-button-text') and contains(text(), 'Thêm')]")));
            button.Click();
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
            Thread.Sleep(500); // Wait for the action to complete
        }
    }
}
