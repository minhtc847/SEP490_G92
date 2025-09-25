using OpenQA.Selenium.Support.UI;
using OpenQA.Selenium;
using SEP490.Common.Services;
using OpenQA.Selenium.Chrome;
using SEP490.Selenium.Product.DTO;
using SEP490.Selenium.ProductionOrder.DTO;
using OpenQA.Selenium.DevTools.V135.Autofill;
using SEP490.Selenium.PO.DTO;

namespace SEP490.Selenium.Product
{
    public class MisaProductService : SeleniumService, IMisaProductService
    {
        public MisaProductService(IConfiguration configuration)
            : base(configuration, "https://actapp.misa.vn/app/IN/INInventoryItems")
        {
        }
    //    
        public string AddProduct(InputSingleProduct input)
        {
            InitSelenium();
            Login();
            Thread.Sleep(1000); // Wait for the page to load
            
            ClickIfExists(
                By.XPath("//div[contains(@class, 'ms-button-text') and contains(text(), 'Thêm')]"),
                driver,
                wait
                );
            Thread.Sleep(500); // Wait for the modal to open
            string productCode = AddField(input);
            CloseDriver();
            return productCode;

        }
        public string AddField(InputSingleProduct input)
        {
            var hangHoaElement = wait.Until(d => d.FindElement(By.XPath("//div[@class='item-title']/div[text()='"+input.Type+"']")));
            hangHoaElement.Click();
            Thread.Sleep(500); // Wait for the dropdown to open

            string productCode = getProductCode();

            var tenInput = wait.Until(d => d.FindElement(By.XPath("//div[text()='Tên']/ancestor::div[contains(@class,'ms-editor')]//input[@type='text']")));
            tenInput.SendKeys(input.Name);
            Thread.Sleep(500); // Wait for the input to be filled
            var donViTinhInput = wait.Until(driver =>
    driver.FindElement(By.XPath("//div[text()='Đơn vị tính chính']/ancestor::div[contains(@class,'ms-combo-box')]//input[@class='combo-input']"))
);
            donViTinhInput.SendKeys(input.Unit);
            Thread.Sleep(1000);
            var catVaThemButton = wait.Until(driver =>
    driver.FindElement(By.XPath("//div[text()='Cất và Thêm']/ancestor::button"))
);
            catVaThemButton.Click();
            Thread.Sleep(500); // Wait for the action to complete
            return productCode;
        }
        private string getProductCode()
        {
            var productIdInput = wait.Until(drv => drv.FindElement(By.XPath("//div[contains(text(),'Mã')]/ancestor::div[contains(@class,'ms-input')]//input")));

            wait.Until(drv => !string.IsNullOrEmpty(productIdInput.GetAttribute("value")));

            return productIdInput.GetAttribute("value");

            
        }

        public void updateProduct(InputUpdateProduct input)
        {
            InitSelenium();
            Login();
            Thread.Sleep(1000);
            updateProductField(input);
            CloseDriver();

        }
        private void updateProductField(InputUpdateProduct input)
        {
            IWebElement searchInput = wait.Until(drv =>
    drv.FindElement(By.XPath("(//input[@placeholder='Tìm kiếm'])[2]"))
);
            searchInput.SendKeys(input.ProductCode.ToString());
            Thread.Sleep(500);
            searchInput.SendKeys(Keys.Enter);
            Thread.Sleep(500);
            var editButton = wait.Until(d => d.FindElement(By.XPath("//div[contains(@class, 'ms-button-text') and contains(text(), 'Sửa')]")));
            editButton.Click();
            Thread.Sleep(500);
            var nameInput = wait.Until(d => d.FindElement(By.XPath("//div[text()='Tên']/ancestor::div[contains(@class,'ms-editor')]//input[@type='text']")));
            ClearAndType(nameInput, input.Name);
            var unitInput = wait.Until(d => d.FindElement(By.XPath("//div[text()='Đơn vị tính chính']/ancestor::div[contains(@class,'ms-combo-box')]//input[@class='combo-input']")));
            ClearAndType(unitInput, input.Unit);
            Thread.Sleep(500);
            var saveButton = wait.Until(d => d.FindElement(By.XPath("//div[text()='Cất']/ancestor::button")));
            saveButton.Click();
            Thread.Sleep(500); // Wait for the action to complete
        }

        public void deleteProduct(string productCode)
        {
            InitSelenium();
            Login();
            Thread.Sleep(1000);
            deleteProductField(productCode);
            CloseDriver();
        }
        private void deleteProductField(string productCode)
        {
            IWebElement searchInput = wait.Until(drv =>
    drv.FindElement(By.XPath("(//input[@placeholder='Tìm kiếm'])[2]"))
);
            searchInput.SendKeys(productCode);
            Thread.Sleep(500);
            searchInput.SendKeys(Keys.Enter);
            Thread.Sleep(500);
            var row = wait.Until(drv => drv.FindElement(By.XPath("//tr[.//span[text()='"+productCode+"']]")));
            var dropdown = row.FindElement(By.XPath(".//button[contains(@class,'expand-more-button')]"));
            dropdown.Click();
            Thread.Sleep(500);
            var deleteButton = wait.Until(drv => drv.FindElement(
    By.XPath("//ul[contains(@class,'ms-dropdown--menu')]//a[normalize-space(text())='Xóa']")
));
            deleteButton.Click();
            Thread.Sleep(500);
            var confirmYes = wait.Until(drv => drv.FindElement(
    By.XPath("//button[div[normalize-space(text())='Có']]")
));

            // Click nút "Có"
            confirmYes.Click();
        }
    }

}
