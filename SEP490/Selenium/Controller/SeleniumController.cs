using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.DB;
using SEP490.Modules.InventorySlipModule.Service;
using SEP490.Selenium.ImportExportInvoice;
using SEP490.Selenium.ImportExportInvoice.DTO;
using SEP490.Selenium.PO;
using SEP490.Selenium.PO.DTO;
using SEP490.Selenium.Product;
using SEP490.Selenium.Product.DTO;
using SEP490.Selenium.ProductionOrder;
using SEP490.Selenium.ProductionOrder.DTO;
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
        private readonly ISeleniumProductionOrderServices _seleniumProductionOrderServices;
        private readonly IImportExportInvoiceServices _importExportInvoiceServices;
        private readonly IInventorySlipService _inventoryServices;
        private readonly IMisaPOService _misaPOService;
        private readonly SEP490DbContext _context;
        public SeleniumController(IMisaProductService misaProductService, 
            ISeleniumSaleOrderServices saleOrderServices, 
            IImportExportInvoiceServices importExportInvoiceServices,
            IInventorySlipService inventorySlipService,
            ISeleniumProductionOrderServices seleniumProductionOrderServices,
            IMisaPOService misaPOService,
            SEP490DbContext context
            )
        {
            _context = context;
            _misaProductService = misaProductService;
            _saleOrderServices = saleOrderServices;
            _importExportInvoiceServices = importExportInvoiceServices;
            _inventoryServices = inventorySlipService;
            _seleniumProductionOrderServices = seleniumProductionOrderServices;
            _misaPOService = misaPOService;
        }
        [HttpPost("product")]
        public IActionResult addProduct(InputSingleProduct product)
        {
            string productCode = _misaProductService.AddProduct(product);
            var newProduct = _context.Products.FirstOrDefault(p=>p.Id == product.ProductId);
            if (newProduct != null) {
                newProduct.ProductCode = productCode;
                _context.Products.Update(newProduct);
                _context.SaveChanges();
            }
            return Ok("Add Product successfully: " + productCode);
        }

        [HttpPut("product")]
        public IActionResult updateProduct(InputUpdateProduct product)
        {
            _misaProductService.updateProduct(product);
            return Ok("Update Product successfully");
        }
        [HttpPost("sale-order")]
        public IActionResult addSaleOrder([FromBody]SaleOrderInput saleOrder)
        {
            string orderId = _saleOrderServices.OpenSaleOrderPage(saleOrder);
            return Ok("Add Sale Order Successfully: " + orderId);
        }
        [HttpPost("production-order")]
        public IActionResult addProductionOrder([FromBody] ProductionOrderInput productionOrder)
        {
            _seleniumProductionOrderServices.OpenProductionOrderPage(productionOrder);
            return Ok("Add Production Order Successfully");
        }

        [HttpPost("import-export-invoice-test")]
        public IActionResult addImportExportInvoiceTest([FromBody] ExportDTO input)
        {
            _importExportInvoiceServices.OpenImportPage(input);
            return Ok("Import page executed.");
        }

        [HttpPost("import-export-invoice")]
        public async Task<IActionResult> addImportExportInvoice([FromBody] int slipId)
        {
            ExportDTO info = await _inventoryServices.GetExportInfoBySlipIdAsync(slipId);
            Task.Run(()=>_importExportInvoiceServices.OpenImportPage(info));
            return Ok("Import page executed.");
        }

        [HttpPost("purchasing-order")]
        public IActionResult addPurchaseOrder([FromBody] InputPO input)
        {
            _misaPOService.Add(input);
            return Ok(" Success");
        }
    }
}
