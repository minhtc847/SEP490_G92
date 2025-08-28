using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using OpenQA.Selenium;
using SEP490.Common.Services;

namespace SEP490.Selenium
{
    public abstract class SeleniumService : BaseService
    {
        protected IWebDriver driver;
        protected WebDriverWait wait;
        protected readonly IConfiguration _config;
        protected string URL;

        protected SeleniumService(IConfiguration configuration, string url)
        {
            _config = configuration;
            URL = url;
        }

        protected virtual void InitSelenium()
        {
            var options = new ChromeOptions();
            //options.AddArgument("--headless=new");
            options.AddArgument("--lang=vi-VN");
            options.AddArgument("--no-sandbox");
            options.AddArgument("--disable-dev-shm-usage");
            options.AddArgument("--disable-gpu");
            options.AddArgument("--window-size=1920,1080");

            options.AddArgument(@"user-data-dir=C:\Users\caomi\AppData\Local\Google\Chrome\User Data");
            options.AddArgument("profile-directory=Profile 1");

            options.AddArgument("--remote-debugging-port=9222");
            options.AddExcludedArgument("enable-automation");
            options.AddAdditionalOption("useAutomationExtension", false);

            driver = new ChromeDriver(options);
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
            driver.Navigate().GoToUrl(URL);
        }

        protected virtual void Login()
        {
            Thread.Sleep(1500);
            var emailInputs = wait.Until(d => d.FindElements(By.Name("username")));
            if (emailInputs.Any())
            {
                IWebElement emailInput = emailInputs[0];
                emailInput.Clear();
                emailInput.SendKeys(_config["Misa:Username"]);

                IWebElement passwordInput = driver.FindElement(By.Name("pass"));
                passwordInput.Clear();
                passwordInput.SendKeys(_config["Misa:Password"]);

                IWebElement loginButton = driver.FindElement(By.CssSelector(
                    "#box-login-right > div > div > div.login-form-basic-container > div > div.login-form-btn-container.login-class > button"
                ));
                loginButton.Click();

                Thread.Sleep(1000);
            }
            Thread.Sleep(1000);

            ClickIfExists(By.XPath("/html/body/div[5]/div/i"), driver, wait);
            Thread.Sleep(1000);

            wait.Until(d => d.FindElement(By.Id("loading-bg")).GetAttribute("style").Contains("display: none"));

            ClickIfExists(
                By.CssSelector("#app > div.w-full.overflow-auto.h-full > div > div > div.cnl-box-container.flexed > div > div.flexed-row.buttons > div:nth-child(1) > button > div"),
                driver,
                wait
            );

            Thread.Sleep(500);

            ClickIfExists(
                By.XPath("//div[@class='ms-button-text ms-button--text flex align-center' and normalize-space()='Đã hiểu']"),
                driver,
                wait
            );
            Thread.Sleep(500);
        }

        protected virtual void CloseDriver()
        {
            if (driver != null)
            {
                driver.Close();
                driver.Quit();
            }
        }

        protected static bool ClickIfExists(By by, IWebDriver driver, WebDriverWait wait)
        {
            try
            {
                var shortWait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
                try
                {
                    shortWait.Until(d =>
                    {
                        var overlays = d.FindElements(By.CssSelector(".ms-popup--background"));
                        return overlays.Count == 0 || overlays.All(o =>
                        {
                            var style = o.GetAttribute("style") ?? "";
                            return !o.Displayed || style.Contains("display: none") || style.Contains("visibility: hidden");
                        });
                    });
                }
                catch (WebDriverTimeoutException)
                {
                }

                var element = wait.Until(d =>
                {
                    var elements = d.FindElements(by);
                    return elements.FirstOrDefault(e => e.Displayed);
                });

                if (element != null)
                {
                    try
                    {
                        element.Click();
                    }
                    catch (ElementClickInterceptedException)
                    {
                        IJavaScriptExecutor js = (IJavaScriptExecutor)driver;
                        js.ExecuteScript("arguments[0].click();", element);
                    }
                    return true;
                }
            }
            catch (WebDriverTimeoutException)
            {
                return false;
            }
            return false;
        }
    
}
}
