using Microsoft.Extensions.Configuration;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;
using SEP490.Common.Services;
using SEP490.DB.Models;
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
            var button = wait.Until(drv => drv.FindElement(By.XPath("//div[contains(@class, 'ms-button-text') and contains(text(), 'Thêm đơn đặt hàng')]//ancestor::button")));
            button.Click();
            AddField(input);
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
        private void AddField(SaleOrderInput soInput)
        {
            Thread.Sleep(1000);
            var userDropdownButton = wait.Until(drv => drv.FindElement(By.XPath(
    "//div[div[contains(@class, 'combo-title__text') and text()='Mã khách hàng']]//following::div[contains(@class, 'btn-dropdown')][1]"
)));
            userDropdownButton.Click();
            Thread.Sleep(1000);
            var option = wait.Until(drv => drv.FindElement(By.XPath(
    "//tr[contains(@class, 'combobox-item')]//td[div/div[text()='" + soInput.CustomerCode + "']]"
)));
            option.Click();
            Thread.Sleep(500);
            var products = soInput.ProductsInput;

            int i = 0;
            Actions actions = new Actions(driver);

            while (i < products.Count)
            {
                if (i > 0)
                {

                    var addRowButton = driver.FindElement(By.XPath(
    "//button[.//div[contains(@class, 'tooltip-content') and text()='Thêm dòng']]"
));
                    // Scroll the button into view
                    ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].scrollIntoView({block: 'center'});", addRowButton);

                    // Wait a bit to allow scrolling animation to complete (optional)
                    Thread.Sleep(500);
                    addRowButton.Click();
                    //break;
                    Thread.Sleep(1000);
                    var productAddInput3 = wait.Until(drv => drv.FindElement(By.XPath(
    "//*[@id=\"body-layout\"]/div[2]/div/div[3]/div/div/div/div/div/div[2]/div/div/div[1]/table/tbody/tr/td[3]/div/div/div[2]/div/span/div/div[2]/div/div[2]/div[2]/div"
)));
                    productAddInput3.Click();
                    Thread.Sleep(1000);
                    IWebElement rowInputText3 = wait.Until(drv => drv.FindElement(By.XPath("//input[contains(@class, 'combo-input') and @type='text']")));
                    rowInputText3.SendKeys(products[i].ProductCode);
                    Thread.Sleep(500);
                    IWebElement rowInputText44 = wait.Until(drv => drv.FindElement(By.CssSelector("td.ms-table--td input.combo-input")));
                    

                    // Gửi nhiều lần Backspace
                    for (int m = 0; m < 7; m++)
                    {
                        rowInputText44.SendKeys(Keys.Backspace);
                    }
                    Thread.Sleep(500);
                    rowInputText44.SendKeys(products[i].ProductCode);
                    Thread.Sleep(2000);
                    var productOption2 = wait.Until(drv => drv.FindElement(By.XPath(
    "//tr[contains(@class, 'combobox-item')]//td[div/div[text()='" + products[i].ProductCode + "']]"
)));
                    productOption2.Click();
                    var input = driver.FindElement(By.XPath(
            "//*[@id=\"body-layout\"]/div[2]/div/div[3]/div/div/div/div/div/div[2]/div/div/div[1]/table/tbody/tr[" + (i + 1) + "]/td[6]/div/div/div[1]/div"
        ));
                    input.Click();
                    var inputCount = wait.Until(d =>
                    {
                        var inputc = d.FindElement(By.CssSelector("td.dynamic-column input[isnumeric='true']"));
                        return (inputc.Displayed && inputc.Enabled) ? inputc : null;
                    });
                    Thread.Sleep(300);
                    inputCount.SendKeys(products[i].ProductQuantity);
                    Thread.Sleep(1000);
                }
                else
                {

                    var productAddInput1 = driver.FindElement(By.XPath(
                            "//*[@id=\"body-layout\"]/div[2]/div/div[3]/div/div/div/div/div/div[2]/div/div/div[1]/table/tbody/tr/td[3]/div"
                        ));
                    productAddInput1.Click();
                    Thread.Sleep(1000);

                    var productAddInput2 = wait.Until(drv => drv.FindElement(By.XPath(
        "//*[@id=\"body-layout\"]/div[2]/div/div[3]/div/div/div/div/div/div[2]/div/div/div[1]/table/tbody/tr/td[3]/div/div/div[2]/div/span/div/div[2]/div/div[2]/div[2]/div"
    )));
                    productAddInput2.Click();
                    Thread.Sleep(1000);
                    IWebElement rowInputText44 = wait.Until(drv => drv.FindElement(By.CssSelector("td.ms-table--td input.combo-input")));
                    rowInputText44.SendKeys(products[i].ProductCode);
                    Thread.Sleep(2000);
                    var productOption = wait.Until(drv => drv.FindElement(By.XPath(
        "//tr[contains(@class, 'combobox-item')]//td[div/div[text()='" + products[i].ProductCode + "']]"
    )));
                    productOption.Click();

                    Thread.Sleep(100);
                    // send key 
                    var input = driver.FindElement(By.XPath(
            "//*[@id=\"body-layout\"]/div[2]/div/div[3]/div/div/div/div/div/div[2]/div/div/div[1]/table/tbody/tr[1]/td[6]/div/div/div[1]/div"
        ));
                    input.Click();
                    var inputCount = wait.Until(d =>
                    {
                        var inputc = d.FindElement(By.CssSelector("td.dynamic-column input[isnumeric='true']"));
                        return (inputc.Displayed && inputc.Enabled) ? inputc : null;
                    });
                    Thread.Sleep(300);
                    inputCount.SendKeys(products[i].ProductQuantity);
                    Thread.Sleep(1000);
                }
                i++;
            }
            var saveButton = driver.FindElements(By.CssSelector("button[shortkey-target='Save']"));
            saveButton[0].Click();
            Thread.Sleep(1000);
            var exitButton = driver.FindElement(By.XPath(
                            "//*[@id=\"header-layout\"]/div/div[4]/div[4]/div[2]/div"
                        ));
            exitButton.Click();
            Thread.Sleep(500);
        }
    }
}
