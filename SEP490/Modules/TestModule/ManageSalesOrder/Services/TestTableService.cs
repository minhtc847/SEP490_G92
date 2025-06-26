using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Selenium.SaleOrder;
using SEP490.Selenium.SaleOrder.DTO;

namespace SEP490.Modules.SalesOrder.ManageSalesOrder.Services
{
    public class TestTableService: BaseService, ITestTableService
    {
        private readonly SEP490DbContext _context;
        private readonly ISeleniumSaleOrderServices _seleniumSaleOrderServices;
        public TestTableService(SEP490DbContext context, ISeleniumSaleOrderServices saleOrderServices)
        {
            _context = context;
            _seleniumSaleOrderServices = saleOrderServices;
        }
        public List<TestTable> GetAll() {
            List<SaleOrderProductsInput> products = new List<SaleOrderProductsInput>
            {
                new SaleOrderProductsInput { ProductCode = "VT00001", ProductQuantity = "2" },
                new SaleOrderProductsInput { ProductCode = "VT00002", ProductQuantity = "3" }
            };
            SaleOrderInput saleOrderInput = new SaleOrderInput
            {
                CustomerCode = "KH00001",
                ProductsInput = products
            };
            _seleniumSaleOrderServices.OpenSaleOrderPage(saleOrderInput);
            return _context.TestTable.ToList();
        }
    }
}
