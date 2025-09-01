using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Selenium.ImportExportInvoice;
using SEP490.Selenium.ImportExportInvoice.DTO;
using SEP490.Selenium.Product;
using SEP490.Selenium.Product.DTO;
using SEP490.Selenium.SaleOrder;
using SEP490.Selenium.SaleOrder.DTO;

namespace SEP490.Selenium.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class SeleniumController : ControllerBase
    {
        private readonly IMisaProductService _misaProductService;
        private readonly ISeleniumSaleOrderServices _saleOrderServices;
        private readonly IImportExportInvoiceServices _importExportInvoiceServices;
        public SeleniumController(IMisaProductService misaProductService, ISeleniumSaleOrderServices saleOrderServices, IImportExportInvoiceServices importExportInvoiceServices)
        {
            _misaProductService = misaProductService;
            _saleOrderServices = saleOrderServices;
            _importExportInvoiceServices = importExportInvoiceServices;

        }
        [HttpPost("product")]
        public IActionResult addProduct(InputSingleProduct product)
        {
            _misaProductService.AddProduct(product);
            return Ok("Add Product successfully.");
        }
        [HttpPost("sale-order")]
        public IActionResult addSaleOrder([FromBody]SaleOrderInput saleOrder)
        {
            _saleOrderServices.OpenSaleOrderPage(saleOrder);
            return Ok("Add Sale Order Successfully");
        }

        [HttpPost("import-export-invoice")]
        public IActionResult addImportExportInvoice([FromBody] ExportDTO input)
        {
            Task.Run(() => _importExportInvoiceServices.OpenImportPage(input));
            return Ok("Processing import page...");
        }
    }
}
