using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using RTools_NTS.Util;
using SEP490.Background;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Hubs;
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
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly IBackgroundTaskQueue _taskQueue;
        private readonly SEP490DbContext _sEP490DbContext;

        public SeleniumController(IServiceScopeFactory serviceScopeFactory, 
            IBackgroundTaskQueue taskQueue,
            SEP490DbContext sEP490DbContext
            )
        {
            _serviceScopeFactory = serviceScopeFactory;
            _taskQueue = taskQueue;
            _sEP490DbContext = sEP490DbContext;
        }

        [HttpPost("product")]
        public IActionResult AddProductAsync(InputSingleProduct product)
        {
            var addproduct = _sEP490DbContext.Products.FirstOrDefault(p => p.Id == product.ProductId);
            if (addproduct == null)
            {
                return NotFound("Product not found.");
            }
            else
            {
                addproduct.isupdatemisa = 2;
                _sEP490DbContext.Products.Update(addproduct);
                _sEP490DbContext.SaveChanges();
            }

            _taskQueue.Enqueue(async token =>
            {
                try
                {
                    using var scope = _serviceScopeFactory.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<SEP490DbContext>();
                    var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<SaleOrderHub>>();
                    var misaProductService = scope.ServiceProvider.GetRequiredService<IMisaProductService>();

                    string productCode = misaProductService.AddProduct(product);

                    var newProduct = await dbContext.Products
                        .FirstOrDefaultAsync(p => p.Id == product.ProductId, token);

                    if (newProduct != null)
                    {
                        newProduct.ProductCode = productCode;
                        newProduct.isupdatemisa = 1;
                        dbContext.Products.Update(newProduct);
                        await dbContext.SaveChangesAsync(token);
                    }

                    await hubContext.Clients.All.SendAsync("MisaUpdate", new
                    {
                        message = "Đã đồng bộ với Misa thành công",
                        type = "Sản Phẩm",
                        codeText = productCode,
                        createAt = DateTime.Now.ToString("HH:mm:ss dd/MM/yyyy")
                    }, token);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Background error] AddProductAsync: {ex}");
                }
            });

            return Ok("Add Product successfully");
        }

        [HttpPut("product")]
        public IActionResult UpdateProduct(InputUpdateProduct product)
        {
            _taskQueue.Enqueue(async token =>
            {
                try
                {
                    using var scope = _serviceScopeFactory.CreateScope();
                    var misaProductService = scope.ServiceProvider.GetRequiredService<IMisaProductService>();
                    var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<SaleOrderHub>>();

                    misaProductService.updateProduct(product);

                    await hubContext.Clients.All.SendAsync("MisaUpdate", new
                    {
                        message = "Đã đồng bộ với Misa thành công",
                        type = "Sản Phẩm",
                        codeText = product.ProductCode,
                        createAt = DateTime.Now.ToString("HH:mm:ss dd/MM/yyyy")
                    }, token);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Background error] UpdateProduct: {ex}");
                }
            });

            return Ok("Update Product successfully");
        }

        [HttpPost("products/add-many")]
        public IActionResult AddManyProducts([FromBody] List<InputSingleProduct> products)
        {
            _taskQueue.Enqueue(async token =>
            {
                try
                {
                    using var scope = _serviceScopeFactory.CreateScope();
                    var dbContext = scope.ServiceProvider.GetRequiredService<SEP490DbContext>();
                    var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<SaleOrderHub>>();
                    var misaProductService = scope.ServiceProvider.GetRequiredService<IMisaProductService>();

                    List<string> productCodes = new();

                    foreach (var product in products)
                    {
                        string productCode = misaProductService.AddProduct(product);
                        var newProduct = await dbContext.Products.FirstOrDefaultAsync(p => p.Id == product.ProductId, token);

                        if (newProduct != null)
                        {
                            newProduct.ProductCode = productCode;
                            dbContext.Products.Update(newProduct);
                            await dbContext.SaveChangesAsync(token);
                        }

                        productCodes.Add(productCode);
                    }

                    string codeText = string.Join(", ", productCodes);

                    await hubContext.Clients.All.SendAsync("MisaUpdate", new
                    {
                        message = "Đã đồng bộ với Misa thành công",
                        type = "Sản Phẩm",
                        codeText,
                        createAt = DateTime.Now.ToString("HH:mm:ss dd/MM/yyyy")
                    }, token);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Background error] AddManyProducts: {ex}");
                }
            });

            return Ok("Add Many Products successfully");
        }

        [HttpPost("sale-order")]
        public IActionResult AddSaleOrder([FromBody] SaleOrderInput saleOrder)
        {
            _taskQueue.Enqueue(async token =>
            {
                try
                {
                    using var scope = _serviceScopeFactory.CreateScope();
                    var saleOrderService = scope.ServiceProvider.GetRequiredService<ISeleniumSaleOrderServices>();
                    var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<SaleOrderHub>>();
                    var dbContext = scope.ServiceProvider.GetRequiredService<SEP490DbContext>();

                    string saleOrderCode = saleOrderService.OpenSaleOrderPage(saleOrder);

                    var order = await dbContext.SaleOrders
                        .FirstOrDefaultAsync(so => so.Id == saleOrder.Id, token);
                    if (order != null)
                    {
                        order.OrderCode = saleOrderCode;
                        order.IsUpdateMisa = true;
                        dbContext.SaleOrders.Update(order);
                        await dbContext.SaveChangesAsync(token);
                    }
                    await hubContext.Clients.All.SendAsync("MisaUpdate", new
                    {
                        message = "Đã đồng bộ với Misa thành công",
                        type = "Đơn Bán Hàng",
                        codeText = saleOrderCode,
                        createAt = DateTime.Now.ToString("HH:mm:ss dd/MM/yyyy")
                    }, token);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Background error] AddSaleOrder: {ex}");
                }
            });

            return Ok("Add Sale Order Successfully");
        }

        [HttpPost("sale-order/add-many")]
        public IActionResult AddManySaleOrders([FromBody] List<SaleOrderInput> saleOrders)
        {
            _taskQueue.Enqueue(async token =>
            {
                try
                {
                    using var scope = _serviceScopeFactory.CreateScope();
                    var saleOrderService = scope.ServiceProvider.GetRequiredService<ISeleniumSaleOrderServices>();
                    var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<SaleOrderHub>>();
                    var dbContext = scope.ServiceProvider.GetRequiredService<SEP490DbContext>();

                    List<string> codes = new();

                    foreach (var saleOrder in saleOrders)
                    {
                        string code = saleOrderService.OpenSaleOrderPage(saleOrder);
                        codes.Add(code);
                        var order = await dbContext.SaleOrders
                            .FirstOrDefaultAsync(so => so.Id == saleOrder.Id, token);
                        if (order != null)
                        {
                            order.OrderCode = code;
                            order.IsUpdateMisa = true;
                            dbContext.SaleOrders.Update(order);
                            await dbContext.SaveChangesAsync(token);
                        }
                    }

                    string codeText = string.Join(", ", codes);

                    await hubContext.Clients.All.SendAsync("MisaUpdate", new
                    {
                        message = "Đã đồng bộ với Misa thành công",
                        type = "Đơn Bán Hàng",
                        codeText,
                        createAt = DateTime.Now.ToString("HH:mm:ss dd/MM/yyyy")
                    }, token);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Background error] AddManySaleOrders: {ex}");
                }
            });

            return Ok("Add Many Sale Orders Successfully");
        }

        [HttpPost("production-order")]
        public IActionResult AddProductionOrder([FromBody] ProductionOrderInput productionOrder)
        {
            _taskQueue.Enqueue(token =>
            {
                try
                {
                    using var scope = _serviceScopeFactory.CreateScope();
                    var service = scope.ServiceProvider.GetRequiredService<ISeleniumProductionOrderServices>();
                    service.OpenProductionOrderPage(productionOrder);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Background error] AddProductionOrder: {ex}");
                }
                return Task.CompletedTask;
            });

            return Ok("Add Production Order Successfully");
        }

        [HttpPost("import-export-invoice-test")]
        public IActionResult AddImportExportInvoiceTest([FromBody] ExportDTO input)
        {
            _taskQueue.Enqueue(token =>
            {
                try
                {
                    using var scope = _serviceScopeFactory.CreateScope();
                    var service = scope.ServiceProvider.GetRequiredService<IImportExportInvoiceServices>();
                    service.OpenImportPage(input);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Background error] AddImportExportInvoiceTest: {ex}");
                }
                return Task.CompletedTask;
            });

            return Ok("Import page executed.");
        }

        [HttpPost("import-export-invoice")]
        public IActionResult AddImportExportInvoice([FromBody] int slipId)
        {
            _taskQueue.Enqueue(async token =>
            {
                try
                {
                    using var scope = _serviceScopeFactory.CreateScope();
                    var inventoryService = scope.ServiceProvider.GetRequiredService<IInventorySlipService>();
                    var service = scope.ServiceProvider.GetRequiredService<IImportExportInvoiceServices>();

                    ExportDTO info = await inventoryService.GetExportInfoBySlipIdAsync(slipId);
                    service.OpenImportPage(info);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Background error] AddImportExportInvoice: {ex}");
                }
            });

            return Ok("Import page executed.");
        }

        [HttpPost("purchasing-order")]
        public IActionResult AddPurchaseOrder([FromBody] InputPO input)
        {
            _taskQueue.Enqueue(async token =>
            {
                try
                {
                    using var scope = _serviceScopeFactory.CreateScope();
                    var service = scope.ServiceProvider.GetRequiredService<IMisaPOService>();
                    var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<SaleOrderHub>>();

                    service.Add(input);

                    await hubContext.Clients.All.SendAsync("MisaUpdate", new
                    {
                        message = "Đã đồng bộ với Misa thành công",
                        type = "Đơn Đặt Hàng",
                        codeText = "",
                        createAt = DateTime.Now.ToString("HH:mm:ss dd/MM/yyyy")
                    }, token);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Background error] AddPurchaseOrder: {ex}");
                }
            });

            return Ok("Add Purchase Order Successfully");
        }

        [HttpPost("purchasing-order/add-many")]
        public IActionResult AddManyPurchaseOrders([FromBody] List<InputPO> inputs)
        {
            _taskQueue.Enqueue(async token =>
            {
                try
                {
                    using var scope = _serviceScopeFactory.CreateScope();
                    var service = scope.ServiceProvider.GetRequiredService<IMisaPOService>();
                    var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<SaleOrderHub>>();

                    foreach (var input in inputs)
                    {
                        service.Add(input);
                    }

                    await hubContext.Clients.All.SendAsync("MisaUpdate", new
                    {
                        message = "Đã đồng bộ với Misa thành công",
                        type = "Đơn Đặt Hàng",
                        codeText = "",
                        createAt = DateTime.Now.ToString("HH:mm:ss dd/MM/yyyy")
                    }, token);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Background error] AddManyPurchaseOrders: {ex}");
                }
            });

            return Ok("Add Many Purchase Orders Successfully");
        }
    }
}
