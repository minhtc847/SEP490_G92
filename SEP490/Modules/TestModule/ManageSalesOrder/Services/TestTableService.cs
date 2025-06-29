using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Selenium.ProductionOrder;
using SEP490.Selenium.ProductionOrder.DTO;
using SEP490.Selenium.SaleOrder;
using SEP490.Selenium.SaleOrder.DTO;

namespace SEP490.Modules.SalesOrder.ManageSalesOrder.Services
{
    public class TestTableService: BaseService, ITestTableService
    {
        private readonly SEP490DbContext _context;
        //private readonly ISeleniumProductionOrderServices seleniumProductionOrderServices;
        private readonly ISeleniumSaleOrderServices seleniumSaleOrderServices;
        public TestTableService(SEP490DbContext context,ISeleniumSaleOrderServices selenium)
        {
            _context = context;
            seleniumSaleOrderServices = selenium;
        }
        public List<TestTable> GetAll() {
            List<SaleOrderProductsInput> products = new List<SaleOrderProductsInput>
            {
                //new SaleOrderProductsInput { ProductCode = "VT00372", ProductQuantity = "2" },
                new SaleOrderProductsInput { ProductCode = "VT00373", ProductQuantity = "2" },
                new SaleOrderProductsInput { ProductCode = "VT00090", ProductQuantity = "3" }
            };
            SaleOrderInput saleOrderInput = new SaleOrderInput
            {
                CustomerCode = "KH00000",
                ProductsInput = products
            };
            seleniumSaleOrderServices.OpenSaleOrderPage(saleOrderInput);
            //ProductionOrderInput productionOrderInput = new ProductionOrderInput
            //    {
            //    SaleOrderCode = "ĐH00003",
            //    OutputProducts = new List<OutputProducts>()
            //    {
            //        new OutputProducts
            //        {
            //            OutputProductCode = "VT00001",
            //            OutputProductQuantity = 2,
            //            InputProducts = new List<InputProduct>()
            //            {
            //                new InputProduct { InputProductCode = "VT00231", InputProductQuantity = 2},
            //                new InputProduct { InputProductCode = "VT00232", InputProductQuantity = 3 }
            //            }
            //        },
            //        new OutputProducts
            //        {
            //            OutputProductCode = "VT00002",
            //            OutputProductQuantity = 3,
            //            InputProducts = new List<InputProduct>()
            //            {
            //                new InputProduct { InputProductCode = "VT00231", InputProductQuantity = 2},
            //                new InputProduct { InputProductCode = "VT00232", InputProductQuantity = 3 }
            //            }
            //        }
            //    },
            //}
            //    ;
            //seleniumProductionOrderServices.OpenProductionOrderPage(productionOrderInput);
            return _context.TestTable.ToList();
        }
    }
}
