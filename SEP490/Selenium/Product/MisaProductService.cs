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
            var options = new ChromeOptions();
            options.AddArgument("--headless=new");
            options.AddArgument("--lang=vi-VN");
            options.AddArgument("--no-sandbox");
            options.AddArgument("--disable-dev-shm-usage");
            options.AddArgument("--disable-gpu");
            options.AddArgument("--window-size=1920,1080");
            driver = new ChromeDriver(options);
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            driver.Navigate().GoToUrl(URL);
        }
        private void Login()
        {
            Thread.Sleep(1500); // Wait for the page to load
            IWebElement emailInput = wait.Until(drv => drv.FindElement(By.Name("username")));
            emailInput.SendKeys(_config["Misa:Username"]);
            IWebElement passwordInput = wait.Until(drv => drv.FindElement(By.Name("pass")));
            passwordInput.SendKeys(_config["Misa:Password"]);
            IWebElement loginButton = driver.FindElement(By.CssSelector("#box-login-right > div > div > div.login-form-basic-container > div > div.login-form-btn-container.login-class > button"));
            loginButton.Click();
            Thread.Sleep(1000);
            //IWebElement skipButton = wait.Until(driver => driver.FindElement(By.XPath("/html/body/div[5]/div/i")));
            //skipButton.Click();
            //Thread.Sleep(2000);
            //wait.Until(d => d.FindElement(By.Id("loading-bg")).GetAttribute("style").Contains("display: none"));

            //var continueBtn = wait.Until(d =>
            //    d.FindElement(By.CssSelector("#app > div.w-full.overflow-auto.h-full > div > div > div.cnl-box-container.flexed > div > div.flexed-row.buttons > div:nth-child(1) > button > div"))
            //);

            //// Click
            //IJavaScriptExecutor js = (IJavaScriptExecutor)driver;
            //js.ExecuteScript("arguments[0].click();", continueBtn);

            // Ấn skip nếu có
            ClickIfExists(By.XPath("/html/body/div[5]/div/i"), driver, wait);

            Thread.Sleep(1000);

            // Đợi loading biến mất
            wait.Until(d => d.FindElement(By.Id("loading-bg")).GetAttribute("style").Contains("display: none"));

            // Ấn continue nếu có
            ClickIfExists(
                By.CssSelector("#app > div.w-full.overflow-auto.h-full > div > div > div.cnl-box-container.flexed > div > div.flexed-row.buttons > div:nth-child(1) > button > div"),
                driver,
                wait
            );

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
            Thread.Sleep(1500); // Wait for the action to complete
        }
        public static bool ClickIfExists(By by, IWebDriver driver, WebDriverWait wait)
        {
            try
            {
                var element = wait.Until(d =>
                {
                    var elements = d.FindElements(by);
                    return elements.FirstOrDefault(e => e.Displayed);
                });

                if (element != null)
                {
                    IJavaScriptExecutor js = (IJavaScriptExecutor)driver;
                    js.ExecuteScript("arguments[0].click();", element);
                    return true;
                }
            }
            catch (WebDriverTimeoutException)
            {
                // Timeout after retries
                return false;
            }
            return false;
        }
    }

}
