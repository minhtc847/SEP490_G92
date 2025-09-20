using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Interactions;
using OpenQA.Selenium.Support.UI;
using SEP490.Common.Services;
using SEP490.Selenium.ImportExportInvoice.DTO;
using SEP490.Selenium.SaleOrder.DTO;
using System;

namespace SEP490.Selenium.ImportExportInvoice
{
    public class ImportExportInvoiceServices: BaseService, IImportExportInvoiceServices
    {
        private readonly IWebDriver driver;
        private string importUrl = "https://actapp.misa.vn/app/popup/INInwardDetail";
        private string exportUrl = "https://actapp.misa.vn/app/popup/INOutward";
        private WebDriverWait wait;
        private readonly IConfiguration _config;
        public ImportExportInvoiceServices(IConfiguration configuration)
        {
            _config = configuration;
            var options = new ChromeOptions();
            //options.AddArgument("--headless=new");
            //options.AddArgument(@"user-data-dir=C:\SeleniumProfiles\Profile1");
            //options.AddArgument("--profile-directory=Profile1");

            //options.AddArgument("--lang=vi-VN");
            //options.AddArgument("--no-sandbox");
            //options.AddArgument("--disable-dev-shm-usage");
            //options.AddArgument("--disable-gpu");
            //options.AddArgument("--window-size=1920,1080");


            options.AddArgument("--lang=vi-VN");
            options.AddArgument("--no-sandbox");
            options.AddArgument("--disable-dev-shm-usage");
            options.AddArgument("--disable-gpu");
            options.AddArgument("--window-size=1920,1080");

            options.AddArgument(_config["ChromeProfile:UserDataDir"]);
            options.AddArgument(_config["ChromeProfile:ProfileDir"]);

            options.AddArgument("--remote-debugging-port=9222");
            options.AddExcludedArgument("enable-automation");
            options.AddAdditionalOption("useAutomationExtension", false);
            //try
            //{
            //DriverHelper.KillChromeDriver();
            driver = new ChromeDriver(options);
            wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));

            //}
            //catch (Exception ex)
            //{
            //    Console.WriteLine("ChromeDriver init error: " + ex.Message);
            //}

        }


        public void OpenImportPage(ExportDTO input)
        {
            driver.Navigate().GoToUrl(importUrl);

            //Login();
            AddField1(input);
            AddField2(input);

            CloseDriver();
        }
        private void Login()
        {
            //Thread.Sleep(1500); // Wait for the page to load
            //IWebElement emailInput = wait.Until(drv => drv.FindElement(By.Name("username")));
            //emailInput.SendKeys(_config["Misa:Username"]);
            //IWebElement passwordInput = wait.Until(drv => drv.FindElement(By.Name("pass")));
            //passwordInput.SendKeys(_config["Misa:Password"]);
            //IWebElement loginButton = driver.FindElement(By.CssSelector("#box-login-right > div > div > div.login-form-basic-container > div > div.login-form-btn-container.login-class > button"));
            //loginButton.Click();
            //Thread.Sleep(1000);


            //// Ấn skip nếu có
            //ClickIfExists(By.XPath("/html/body/div[5]/div/i"), driver, wait);

            //Thread.Sleep(1000);

            //// Đợi loading biến mất
            //wait.Until(d => d.FindElement(By.Id("loading-bg")).GetAttribute("style").Contains("display: none"));

            //// Ấn continue nếu có
            //ClickIfExists(
            //    By.CssSelector("#app > div.w-full.overflow-auto.h-full > div > div > div.cnl-box-container.flexed > div > div.flexed-row.buttons > div:nth-child(1) > button > div"),
            //    driver,
            //    wait
            //);
            Thread.Sleep(500);
            //Add Button Da hieu 
            ClickIfExists(
        By.XPath("//button[.//div[normalize-space()='Đã hiểu']]"),
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
        private void AddField1(ExportDTO ExportInput)
        {
            Thread.Sleep(1000);
            //            var dropdownButton = wait.Until(drv => drv.FindElement(
            //    By.CssSelector("div[ms-value-field='itemTypeCode'] .btn-dropdown")
            //));

            var dropdownButton = wait.Until(drv => drv.FindElement(
    By.XPath("//div[@ms-value-field='itemTypeCode']//div[contains(@class,'btn-dropdown')]")
));
            dropdownButton.Click();

            var option = wait.Until(drv => drv.FindElement(
    By.XPath("//div[contains(@class,'combobox-item--text') and normalize-space(text())='1. Thành phẩm sản xuất']")
));
            option.Click();

            var empInput = wait.Until(drv => drv.FindElement(
    By.CssSelector("div[ms-value-field='account_object_id'] input")));
            empInput.Click();
            empInput.SendKeys(ExportInput.EmployeeName);

            Thread.Sleep(2000);

            var productsImport = ExportInput.ProductsImport;

            for (int i = 0; i < productsImport.Count; i++)
            {

                var popupDiv = driver.FindElement(By.CssSelector("div.ms-popup.detail-page-popup"));


                var productInputCell = wait.Until(drv => popupDiv.FindElement(
    By.CssSelector("tr:last-child td:nth-child(3)")));
                // chỉ click lần đầu tiên
                if (i == 0)
                {
                    productInputCell.Click();
                }

                var inputProduct = wait.Until(drv => productInputCell.FindElement(
    By.CssSelector("div[ms-value-field='inventory_item_id'] input")));
                inputProduct.SendKeys(productsImport[i].ProductName);
                Thread.Sleep(1000);

                var khoCell = wait.Until(drv => popupDiv.FindElement(
    By.CssSelector("tr:last-child td:nth-child(5)")));
                khoCell.Click();

                var khoInput = wait.Until(drv => khoCell.FindElement(By.CssSelector("input")));
                khoInput.SendKeys("NVL");

                var cellSoLuong = wait.Until(drv => popupDiv.FindElement(
    By.CssSelector("tr:last-child td:nth-child(9)")));
                cellSoLuong.Click();
                var inputSoLuong = wait.Until(drv => cellSoLuong.FindElement(By.CssSelector("input")));
                Thread.Sleep(1000);
                inputSoLuong.SendKeys(productsImport[i].ProductQuantity);
                Thread.Sleep(1000);

                if (i < productsImport.Count - 1)
                {
                    var addRowButton = driver.FindElement(By.XPath(
                        "//button[.//div[contains(@class, 'tooltip-content') and text()='Thêm dòng']]"
                    ));
                    addRowButton.Click();
                    Thread.Sleep(1000);
                }
            }

            var saveButton = driver.FindElements(By.CssSelector("button[shortkey-target='Save']"));
            saveButton[0].Click();
            Thread.Sleep(1000);

            //var confirmDiv = driver.FindElement(By.CssSelector("div.ms-message-box--content"));

            //var buttonCo = driver.FindElement(By.XPath("//button[.//div[text()='Có']]"));
            //buttonCo.Click();
            //Thread.Sleep(500);

            var confirmDivs = driver.FindElements(By.CssSelector("div.ms-message-box--content"));
            if (confirmDivs.Count > 0)
            {
                // Nếu có thì tìm nút "Có" và click
                var buttonCo = driver.FindElement(By.XPath("//button[.//div[text()='Có']]"));
                buttonCo.Click();
                Thread.Sleep(500);
            }

            var closeBtn = wait.Until(drv => drv.FindElement(
     By.CssSelector("div.close-btn.header-detail-btn")
 ));
            closeBtn.Click();
            Thread.Sleep(5000);
        }
        private void AddField2(ExportDTO ExportInput)
        {
            //EXPORT
            driver.Navigate().GoToUrl(exportUrl);
            //var popupDiv = driver.FindElement(By.CssSelector("div.ms-popup.detail-page-popup"));

            //// Lấy popup cuối cùng (popup mới mở)
            //var latestPopup = popupDiv.Last();

            Thread.Sleep(5000);
            var dropdownButtonExport = wait.Until(drv => drv.FindElement(
    By.XPath("//div[@ms-value-field='itemTypeCode']//div[@class='btn-dropdown']")
));
            dropdownButtonExport.Click();

            var optionExport = wait.Until(drv => drv.FindElement(
    By.XPath("//div[contains(@class,'combobox-item--text') and normalize-space(text())='2. Sản xuất']")
));
            optionExport.Click();

            var empInputExport = wait.Until(drv => drv.FindElement(
    By.CssSelector("div[ms-value-field='account_object_id'] input")));
            empInputExport.Click();
            empInputExport.SendKeys(ExportInput.EmployeeName);

            Thread.Sleep(2000);

            var productExport = ExportInput.ProductsExport;

            for (int i = 0; i < productExport.Count; i++)
            {

                var popupDiv = driver.FindElement(By.CssSelector("div.ms-popup.detail-page-popup"));


                var productInputCell = wait.Until(drv => popupDiv.FindElement(
    By.CssSelector("tr:last-child td:nth-child(3)")));
                // chỉ click lần đầu tiên
                if (i == 0)
                {
                    productInputCell.Click();
                }

                var inputProduct = wait.Until(drv => productInputCell.FindElement(
    By.CssSelector("div[ms-value-field='inventory_item_id'] input")));
                inputProduct.SendKeys(productExport[i].ProductName);
                Thread.Sleep(1000);

                var khoCell = wait.Until(drv => popupDiv.FindElement(
    By.CssSelector("tr:last-child td:nth-child(5)")));

                // scroll cell này ra giữa màn hình (cả ngang lẫn dọc)
                ((IJavaScriptExecutor)driver).ExecuteScript(
                    "arguments[0].scrollIntoView({behavior: 'instant', block: 'nearest', inline: 'center'});",
                    khoCell
                );


                khoCell.Click();

                var khoInput = wait.Until(drv => khoCell.FindElement(By.CssSelector("input")));
                khoInput.SendKeys("NVL");

                var cellSoLuong = wait.Until(drv => popupDiv.FindElement(
    By.CssSelector("tr:last-child td:nth-child(9)")));
                cellSoLuong.Click();
                var inputSoLuong = wait.Until(drv => cellSoLuong.FindElement(By.CssSelector("input")));
                Thread.Sleep(1000);
                inputSoLuong.SendKeys(productExport[i].ProductQuantity);
                Thread.Sleep(1000);

                

                
                // tìm cell chi phí (cột 16, dòng cuối)
                var cellChiPhi = wait.Until(drv => popupDiv.FindElement(
                    By.CssSelector("tr:last-child td:nth-child(16)")
                ));

                // scroll cell này ra giữa màn hình (cả ngang lẫn dọc)
                ((IJavaScriptExecutor)driver).ExecuteScript(
                    "arguments[0].scrollIntoView({behavior: 'instant', block: 'nearest', inline: 'center'});",
                    cellChiPhi
                );

                // click vào cell để focus
                cellChiPhi.Click();
                Thread.Sleep(500);

                // sau khi cell được click mới tìm dropdown bên trong cell
                var dropdownExpenseItem = wait.Until(drv => cellChiPhi.FindElement(
                    By.CssSelector("div[ms-value-field='expense_item_id'] .btn-dropdown")
                ));

                // scroll tiếp nếu dropdown bị che
                //((IJavaScriptExecutor)driver).ExecuteScript(
                //    "arguments[0].scrollIntoView({behavior: 'auto', block: 'nearest', inline: 'center'});",
                //    dropdownExpenseItem
                //);

                // click dropdown
                dropdownExpenseItem.Click();
                Thread.Sleep(1000);



                // Đầu tiên chờ dropdown panel hiển thị
                var dropdown = wait.Until(drv => drv.FindElement(
                    By.CssSelector("div.combo-dropdown-panel .dropdown-body-container table.dropdown-table")
                ));

                // Sau đó tìm item "Chi phí vật liệu" bên trong dropdown
                var itemChiPhi = dropdown.FindElement(
                    By.XPath(".//div[contains(@class,'combobox-item-td--text') and normalize-space(text())='Chi phí dụng cụ sản xuất']")
                );

                // Click item
                itemChiPhi.Click();

                Thread.Sleep(1000);
                if (i < productExport.Count - 1)
                {
                    var addRowButton = driver.FindElement(By.XPath(
                        "//button[.//div[contains(@class, 'tooltip-content') and text()='Thêm dòng']]"
                    ));
                    addRowButton.Click();
                    Thread.Sleep(1000);
                }
            }

            var saveButton = driver.FindElements(By.CssSelector("button[shortkey-target='Save']"));
            saveButton[0].Click();
            Thread.Sleep(1000);

            //var confirmDiv = driver.FindElement(By.CssSelector("div.ms-message-box--content"));

            //var buttonCo = driver.FindElement(By.XPath("//button[.//div[text()='Có']]"));
            //buttonCo.Click();
            Thread.Sleep(5000);
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

