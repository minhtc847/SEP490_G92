using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using OpenQA.Selenium;
using SEP490.Common.Services;
using SEP490.Selenium.ProductionOrder.DTO;
using OpenQA.Selenium.Interactions;

namespace SEP490.Selenium.ProductionOrder
{
    public class SeleniumProductionOrderServices : BaseService, ISeleniumProductionOrderServices
    {
        private IWebDriver driver;
        private string URL = "https://actapp.misa.vn/app/IN/INProductionOrder";
        private WebDriverWait wait;
        private readonly IConfiguration _config;
        public SeleniumProductionOrderServices(IConfiguration configuration)
        {
            _config = configuration;
        }
        private void InitSelenium()
        {
            driver = new ChromeDriver();
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            driver.Navigate().GoToUrl(URL);
        }
        public void OpenProductionOrderPage(ProductionOrderInput input)
        {
            InitSelenium();
            Login();
            Thread.Sleep(5000); // Wait for the page to load
            var button = wait.Until(drv => drv.FindElement(By.XPath("//div[contains(@class, 'ms-button-text') and contains(text(), 'Thêm lệnh sản xuất')]")));
            button.Click();
            Thread.Sleep(500); // Wait for the modal to open
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
        //#header-layout > div > div.header-detail-input > div > div:nth-child(2) > span > div > div.tooltip-content > div > div.combo-actions > div.btn-dropdown > div
        private void AddField(ProductionOrderInput poInput)
        {
            Thread.Sleep(1000);
            IWebElement userDropDown = wait.Until(drv => drv.FindElement(By.CssSelector("#header-layout > div > div.header-detail-input > div > div:nth-child(2) > span > div > div.tooltip-content > div > div.combo-actions > div.btn-dropdown > div")));
            userDropDown.Click();
            Thread.Sleep(3000);
            var option = wait.Until(drv => drv.FindElement(By.XPath(
    "//tr[contains(@class, 'combobox-item')]//td[div/div[text()='" + poInput.SaleOrderCode + "']]"
)));
            option.Click();
            Thread.Sleep(500);
            var products = poInput.OutputProducts;
            int i = 0;

            ////*[@id="body-layout"]/div[1]/div/div[1]/div/div[2]/div/div/div/div[2]/div/div/div/table/tbody/tr[2]/td[3]/div/div/div[2]/div/span/div/div[2]/div/div[2]/div[2]
            Actions actions = new Actions(driver);
            while (i < products.Count)
            {
                if (i > 0)
                {
                    var newRowButton = wait.Until(d =>
                    {
                        var inputc = d.FindElement(By.CssSelector("#add-row-btn"));
                        return (inputc.Displayed && inputc.Enabled) ? inputc : null;
                    });
                    newRowButton.Click();
                }
                
                    IWebElement pInput1 = wait.Until(drv => drv.FindElement(By.XPath("//*[@id=\"body-layout\"]/div[1]/div/div[1]/div/div[2]/div/div/div/div[2]/div/div/div/table/tbody/tr["+ (i + 1) + "]/td[3]/div")));
                    pInput1.Click();
                
                Thread.Sleep(3000);
                IWebElement rowInput1 = wait.Until(drv => drv.FindElement(By.XPath("//*[@id=\"body-layout\"]/div[1]/div/div[1]/div/div[2]/div/div/div/div[2]/div/div/div/table/tbody/tr["+ (i + 1) + "]/td[3]/div/div/div[2]/div/span/div/div[2]/div/div[2]/div[2]")));
                rowInput1.Click();
                Thread.Sleep(500);
                IWebElement rowInputText1 = wait.Until(drv => drv.FindElement(By.XPath("//input[contains(@class, 'combo-input') and @type='text']")));
                //rowInputText1.Click();
                rowInputText1.SendKeys(products[i].OutputProductCode);
                Thread.Sleep(500);
                var optionPInput1 = wait.Until(drv => drv.FindElement(By.XPath(
    "//tr[contains(@class, 'combobox-item')]//td[div/div[text()='" + products[i].OutputProductCode + "']]"
)));
                optionPInput1.Click();
                var inputCountClick1 = driver.FindElement(By.XPath(
            "//*[@id=\"body-layout\"]/div[1]/div/div[1]/div/div[2]/div/div/div/div[2]/div/div/div/table/tbody/tr["+ (i + 1) + "]/td[6]/div/div"
        ));
                inputCountClick1.Click();
                Thread.Sleep(500);
                var inputCount1 = wait.Until(d =>
                {
                    var inputc = d.FindElement(By.CssSelector("td.dynamic-column input[isnumeric='true']"));
                    return (inputc.Displayed && inputc.Enabled) ? inputc : null;
                });
                inputCount1.SendKeys(products[i].OutputProductQuantity.ToString());

                int j=0;
                while (j < products[i].InputProducts.Count)
                {
                    if (j > 0)
                    {
                        var newRowButton2 = wait.Until(d =>
                        {
                            var inputc = d.FindElement(By.CssSelector("#add-row-btn"));
                            return (inputc.Displayed && inputc.Enabled) ? inputc : null;
                        });
                        newRowButton2.Click();
                    }
                    ////*[@id="body-layout"]/div[1]/div/div[2]/div/div[2]/div/div/div/div[2]/div/div/div/table/tbody/tr/td[3]/div
                    Thread.Sleep(1000);
                    IWebElement pInput2 = wait.Until(drv => drv.FindElement(By.XPath("//*[@id=\"body - layout\"]/div[1]/div/div[2]/div/div[2]/div/div/div/div[2]/div/div/div/table/tbody/tr["+ (j + 1) + "]/td[3]")));
                    pInput2.Click();
                    //
                    IWebElement rowInput2 = wait.Until(drv => drv.FindElement(By.XPath("//*[@id=\"body - layout\"]/div[1]/div/div[2]/div/div[2]/div/div/div/div[2]/div/div/div/table/tbody/tr["+ (j + 1) + "]/td[3]/div/div/div[2]/div/span/div/div[2]/div/div[2]/div[2]")));
                    rowInput2.Click();
                    Thread.Sleep(500);
                    IWebElement rowInputText2 = wait.Until(drv => drv.FindElement(By.XPath("//input[contains(@class, 'combo-input') and @type='text']")));
                    rowInputText2.SendKeys(products[i].InputProducts[j].InputProductCode);
                    Thread.Sleep(500);
                    var optionPInput2 = wait.Until(drv => drv.FindElement(By.XPath(
    "//tr[contains(@class, 'combobox-item')]//td[div/div[text()='" + products[i].InputProducts[j].InputProductCode + "']]"
)));
                    optionPInput2.Click();

                    var inputCountClick2 = driver.FindElement(By.XPath(
            "//*[@id=\"body - layout\"]/div[1]/div/div[2]/div/div[2]/div/div/div/div[2]/div/div/div/table/tbody/tr["+ (j + 1) + "]/td[6]/div"
        ));
                    inputCountClick2.Click();
                    Thread.Sleep(500);
                    var inputCount2 = wait.Until(d =>
                    {
                        var inputc = d.FindElement(By.CssSelector("td.dynamic-column input[isnumeric='true']"));
                        return (inputc.Displayed && inputc.Enabled) ? inputc : null;
                    });
                    inputCount2.SendKeys(products[i].OutputProductQuantity.ToString());
                    j++;
                }


                i++;
            }
        }
    }
}
