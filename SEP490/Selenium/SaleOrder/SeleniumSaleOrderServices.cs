using Microsoft.Extensions.Configuration;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using SEP490.Common.Services;
using SEP490.Selenium.SaleOrder.DTO;

namespace SEP490.Selenium.SaleOrder
{
    public class SeleniumSaleOrderServices : BaseService, ISeleniumSaleOrderServices
    {
        private readonly IWebDriver driver;
        private string saleOrderUrl = "https://actapp.misa.vn/app/SA/SAOrder";
        private WebDriverWait wait;
        private readonly IConfiguration _config;
        public SeleniumSaleOrderServices(IConfiguration configuration)
        {
            driver = new ChromeDriver();
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            _config = configuration;
        }
        public void OpenSaleOrderPage(SaleOrderInput input)
        {
            driver.Navigate().GoToUrl(saleOrderUrl);
            Login();
            Thread.Sleep(5000);
            var button = driver.FindElement(By.XPath("//div[contains(@class, 'ms-button-text') and contains(text(), 'Thêm đơn đặt hàng')]//ancestor::button"));
            button.Click();
            Thread.Sleep(5000);
            var userDropdownButton = driver.FindElement(By.XPath(
    "//div[div[contains(@class, 'combo-title__text') and text()='Mã khách hàng']]//following::div[contains(@class, 'btn-dropdown')][1]"
));
            userDropdownButton.Click();
            Thread.Sleep(1000);
            var option = wait.Until(drv => drv.FindElement(By.XPath(
    "//tr[contains(@class, 'combobox-item')]//td[div/div[text()='"+input.CustomerCode+"']]"
)));
            option.Click();
            Thread.Sleep(5000);
            CloseDriver();

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
            Thread.Sleep(5000);
        }
        private void CloseDriver()
        {
            if (driver != null)
            {
                driver.Close();
                driver.Quit();
            }
        }
        private void AddField(SaleOrderInput input)
        {

        }
    }
}
