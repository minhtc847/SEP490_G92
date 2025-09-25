using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;
using SEP490.Selenium.PO.DTO;

namespace SEP490.Selenium.PO
{
    public class MisaPOService : SeleniumService, IMisaPOService
    {
        public MisaPOService(IConfiguration configuration)
            : base(configuration, "https://actapp.misa.vn/app/PU/PUOrder/PUOrderList")
        {
        }
        public string Add(InputPO inputPO)
        {
            InitSelenium();
            Login();
            Thread.Sleep(500); // Wait for the page to load
            string orderCode = "";
            ClickIfExists(
                By.XPath("//div[contains(@class, 'ms-button-text') and contains(text(), 'Thêm')]"),
                driver,
                wait
                );
            var orderIdInput = wait.Until(drv => drv.FindElement(By.XPath("//div[contains(text(),'Số đơn hàng')]/ancestor::div[contains(@class,'ms-input')]//input")));

            wait.Until(drv => !string.IsNullOrEmpty(orderIdInput.GetAttribute("value")));

            orderCode = orderIdInput.GetAttribute("value");
            AddField(inputPO);
            Thread.Sleep(500);
            CloseDriver();
            return orderCode;
        }
        private void AddField(InputPO inputPO)
        {
            var userDropdownButton = wait.Until(drv => drv.FindElement(By.XPath(
    "//*[@id=\"body-layout\"]/div[1]/div/div/div[1]/span/div/div[1]/div[1]/div[1]/div/div[1]/div[1]/div/span/div/div[2]/div/div[1]/input"
)));
            userDropdownButton.SendKeys(inputPO.supplierName);
            Thread.Sleep(1000);
            var option = wait.Until(drv => drv.FindElement(By.XPath(
    "//tr[contains(@class, 'combobox-item')]//td[div/div[text()='" + inputPO.supplierName + "']]"
)));
            option.Click();
            Thread.Sleep(500);
            IWebElement dateInput = driver.FindElement(
    By.XPath("//div[contains(@class,'ms-input-title') and text()='Ngày giao hàng']/ancestor::div[contains(@class,'ms-date-picker-container')]//input[@placeholder='DD/MM/YYYY']")
);
            ClearAndType(dateInput, inputPO.date);


            var products = inputPO.ProductsInput;

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
    "//tr[contains(@class,'combobox-item') and .//div[text()='" + products[i].ProductCode + "']]//td[2]//div[contains(@class,'combobox-item-td--text')]"
)));
                    //productOption2.Click();
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
                    Thread.Sleep(300);
                    ////*[@id="body-layout"]/div[2]/div/div[3]/div/div/div/div/div/div[2]/div/div/div[1]/table/tbody/tr/td[9]/div/div/div[1]
                    var inputPrice = driver.FindElement(By.XPath(
            "//*[@id=\"body-layout\"]/div[2]/div/div[3]/div/div/div/div/div/div[2]/div/div/div[1]/table/tbody/tr[" + (i + 1) + "]/td[8]/div/div/div[1]/div"
        ));
                    inputPrice.Click();
                    var inputPrice2 = wait.Until(d =>
                    {
                        var inputc = d.FindElement(By.CssSelector("td.dynamic-column input[isnumeric='true']"));
                        return (inputc.Displayed && inputc.Enabled) ? inputc : null;
                    });
                    Thread.Sleep(300);
                    inputPrice2.SendKeys(products[i].Price);
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
    "//tr[contains(@class,'combobox-item') and .//div[text()='" + products[i].ProductCode + "']]//td[2]//div[contains(@class,'combobox-item-td--text')]"
)));
                    //productOption.Click();

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
                    Thread.Sleep(300);
                    var inputPrice = driver.FindElement(By.XPath(
            "//*[@id=\"body-layout\"]/div[2]/div/div[3]/div/div/div/div/div/div[2]/div/div/div[1]/table/tbody/tr[1]/td[8]/div/div/div[1]/div"
        ));
                    inputPrice.Click();
                    var inputPrice2 = wait.Until(d =>
                    {
                        var inputc = d.FindElement(By.CssSelector("td.dynamic-column input[isnumeric='true']"));
                        return (inputc.Displayed && inputc.Enabled) ? inputc : null;
                    });
                    Thread.Sleep(300);
                    inputPrice2.SendKeys(products[i].Price);
                    Thread.Sleep(300);
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
