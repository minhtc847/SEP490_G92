using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.PurchaseOrderModule.DTO;
using SEP490.Modules.PurchaseOrderModule.Service;
using System.Linq;
using System.Threading.Tasks;
using TestVNG.Setup;
using Xunit;

namespace TestVNG.Services
{
    public class PurchaseOrderServiceTest : TestBase
    {
        private readonly SEP490DbContext _context;
        private readonly PurchaseService _purchaseOrderService;

        public PurchaseOrderServiceTest()
        {
            _context = CreateInMemoryDbContext();
            _purchaseOrderService = new PurchaseService(_context, null);
        }

        //-------------------- GetAllPurchaseOrdersAsync ---------------------

        [Fact]
        public async Task GetAllPurchaseOrdersAsync_NoPurchaseOrders_ReturnsEmptyList()
        {
            var result = await _purchaseOrderService.GetAllPurchaseOrdersAsync();

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetAllPurchaseOrdersAsync_WithFullData_ReturnsCorrectInfo()
        {
            SeedTestData(_context);

            var result = await _purchaseOrderService.GetAllPurchaseOrdersAsync();

            Assert.NotEmpty(result);
            var order = result.First(o => o.Code == "MH00001");
            Assert.Equal("Supplier A", order.SupplierName);
            Assert.Equal("Customer B", order.CustomerName);
            Assert.Equal("Employee Y", order.EmployeeName);
        }

        [Fact]
        public async Task GetAllPurchaseOrdersAsync_WithNullSupplierCustomer_ReturnsNullFields()
        {
            SeedTestData(_context);

            var result = await _purchaseOrderService.GetAllPurchaseOrdersAsync();

            var order = result.FirstOrDefault(o => o.Code == "MH00002");
            Assert.NotNull(order);
            Assert.Null(order.SupplierName);
            Assert.Null(order.CustomerName);
        }


        //-------------------- GetPurchaseOrderByIdAsync ---------------------

        [Fact]
        public async Task GetPurchaseOrderByIdAsync_IdNotFound_ReturnsNull()
        {
            var result = await _purchaseOrderService.GetPurchaseOrderByIdAsync(999);

            Assert.Null(result);
        }

        [Fact]
        public async Task GetPurchaseOrderByIdAsync_IdExists_ReturnsCorrectData()
        {
            SeedTestData(_context);

            var result = await _purchaseOrderService.GetPurchaseOrderByIdAsync(1);

            Assert.NotNull(result);
            Assert.Equal("MH00001", result.Code);
            Assert.Equal("Supplier A", result.SupplierName);
            Assert.Equal("Customer B", result.CustomerName);
            Assert.Equal("Employee Y", result.EmployeeName);
            Assert.NotEmpty(result.PurchaseOrderDetails);
        }

        [Fact]
        public async Task GetPurchaseOrderByIdAsync_IdExists_ProductMappedCorrectly()
        {
            SeedTestData(_context);

            var result = await _purchaseOrderService.GetPurchaseOrderByIdAsync(1);

            Assert.NotNull(result);
            var detail = result.PurchaseOrderDetails.First();
            Assert.Equal("Product Test", detail.ProductName);
            Assert.Equal("PROD100", detail.ProductCode);
            Assert.Equal("Glass A", detail.GlassStructureName);
        }

        //-------------------- CreatePurchaseOrderAsync ---------------------

        [Fact]
        public async Task CreatePurchaseOrderAsync_NewCustomer_CreatedAndLinked()
        {
            _context.Products.Add(new Product
            {
                ProductName = "Product 1",
                ProductCode = "P001",
                ProductType = "Type A",
                UOM = "Tấm",
                Height = "200",
                Width = "100",
                Thickness = 5,
                Weight = 10,
                UnitPrice = 100000,
                quantity = 10
            });
            await _context.SaveChangesAsync();

            var dto = new CreatePurchaseOrderDto
            {
                CustomerName = "New Supplier",
                Date = DateTime.Now,
                Description = "Test new supplier",
                Products = new[]
                {
            new CreatePurchaseOrderDetailDto
            {
                ProductName = "Product 1",
                Quantity = 5
            }
        }.ToList()
            };

            var id = await _purchaseOrderService.CreatePurchaseOrderAsync(dto);

            var order = await _context.PurchaseOrders.FindAsync(id);
            Assert.NotNull(order);

            var newCustomer = await _context.Customers.FirstOrDefaultAsync(c => c.CustomerName == "New Supplier");
            Assert.NotNull(newCustomer);
            Assert.True(newCustomer.IsSupplier);
            Assert.Equal(newCustomer.Id, order.CustomerId);
        }

        [Fact]
        public async Task CreatePurchaseOrderAsync_ExistingCustomer_NotCreatedAgain()
        {
            SeedTestData(_context);

            var dto = new CreatePurchaseOrderDto
            {
                CustomerName = "Supplier A",
                Date = DateTime.Now,
                Description = "Test existing supplier",
                Products = new[]
                {
                    new CreatePurchaseOrderDetailDto
                    {
                        ProductName = "Product 1",
                        Quantity = 5
                    }
                }.ToList()
            };

            var existingCustomerCount = _context.Customers.Count();
            var id = await _purchaseOrderService.CreatePurchaseOrderAsync(dto);
            var newCount = _context.Customers.Count();

            Assert.Equal(existingCustomerCount, newCount);
        }

        [Fact]
        public async Task CreatePurchaseOrderAsync_NoCodeProvided_AutoGeneratedCode()
        {
            SeedTestData(_context);

            var dto = new CreatePurchaseOrderDto
            {
                CustomerName = "Supplier A",
                Code = null,
                Date = DateTime.Now,
                Description = "Auto code test",
                Products = new[]
                {
                    new CreatePurchaseOrderDetailDto
                    {
                        ProductName = "Product 1",
                        Quantity = 2
                    }
                }.ToList()
            };

            var id = await _purchaseOrderService.CreatePurchaseOrderAsync(dto);

            var order = await _context.PurchaseOrders.FindAsync(id);
            Assert.Matches(@"^MH\d{5}$", order.Code);
        }

        [Fact]
        public async Task CreatePurchaseOrderAsync_ProductNotExists_ThrowsException()
        {
            SeedTestData(_context);

            var dto = new CreatePurchaseOrderDto
            {
                CustomerName = "Supplier A",
                Date = DateTime.Now,
                Description = "Non-existing product",
                Products = new[]
                {
                    new CreatePurchaseOrderDetailDto
                    {
                        ProductName = "NonExistentProduct",
                        Quantity = 1
                    }
                }.ToList()
            };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(async () =>
            {
                await _purchaseOrderService.CreatePurchaseOrderAsync(dto);
            });
            Assert.Equal("Product 'NonExistentProduct' does not exist", ex.Message);

        }

        [Fact]
        public async Task CreatePurchaseOrderAsync_ProductExists_LinkedCorrectly()
        {
            var context = CreateInMemoryDbContext();
            context.Products.AddRange(TestData.GetSampleProducts());
            context.Customers.Add(new Customer { Id = 10, CustomerName = "Supplier A", IsSupplier = true });
            await context.SaveChangesAsync();

            var service = new PurchaseService(context, null);

            var dto = new CreatePurchaseOrderDto
            {
                CustomerName = "Supplier A",
                Date = DateTime.Now,
                Description = "Existing product test",
                Products = new List<CreatePurchaseOrderDetailDto>
        {
            new CreatePurchaseOrderDetailDto
            {
                ProductName = "Product 1",
                Quantity = 3
            }
        }
            };

            var id = await service.CreatePurchaseOrderAsync(dto);
            var detail = context.PurchaseOrderDetails.FirstOrDefault(d => d.PurchaseOrderId == id);

            Assert.NotNull(detail);
        }

        //-------------------- DeletePurchaseOrderAsync ---------------------

        [Fact]
        public async Task DeletePurchaseOrderAsync_IdNotFound_ReturnsFalse()
        {
            var result = await _purchaseOrderService.DeletePurchaseOrderAsync(999);

            Assert.False(result);
            Assert.Equal(0, _context.PurchaseOrders.Count());
        }

        [Fact]
        public async Task DeletePurchaseOrderAsync_IdExistsWithDetails_DeletesOrderAndDetails()
        {
            SeedTestData(_context);

            var order = await _context.PurchaseOrders.FirstAsync(po => po.Id == 1);
            _context.PurchaseOrderDetails.Add(new PurchaseOrderDetail
            {
                PurchaseOrderId = order.Id,
                ProductName = "Test Product",
                Quantity = 2,
                UnitPrice = 1000,
                TotalPrice = 2000
            });
            await _context.SaveChangesAsync();

            var result = await _purchaseOrderService.DeletePurchaseOrderAsync(order.Id);

            Assert.True(result);

            var deletedOrder = await _context.PurchaseOrders.FindAsync(order.Id);
            Assert.Null(deletedOrder);

            var remainingDetails = _context.PurchaseOrderDetails
                .Where(d => d.PurchaseOrderId == order.Id)
                .ToList();
            Assert.Empty(remainingDetails); 
        }

        [Fact]
        public async Task DeletePurchaseOrderAsync_IdExistsWithoutDetails_DeletesOrderOnly()
        {
            SeedTestData(_context);

            var newOrder = new PurchaseOrder
            {
                Id = 100,
                Code = "MH99999",
                Date = System.DateTime.Now,
                Description = "Order without details",
                TotalValue = 100000,
                Status = PurchaseStatus.Pending
            };
            _context.PurchaseOrders.Add(newOrder);
            await _context.SaveChangesAsync();

            var result = await _purchaseOrderService.DeletePurchaseOrderAsync(newOrder.Id);

            Assert.True(result);

            var deletedOrder = await _context.PurchaseOrders.FindAsync(newOrder.Id);
            Assert.Null(deletedOrder);
        }


        //-------------------- UpdatePurchaseOrderAsync ---------------------

        [Fact]
        public async Task UpdatePurchaseOrderAsync_IdNotFound_ReturnsFalse()
        {
            var dto = new UpdatePurchaseOrderDto
            {
                CustomerName = "New Customer",
                Description = "Updated Description",
                Status = "Pending",
                Products = new System.Collections.Generic.List<UpdatePurchaseOrderDetailDto>()
            };

            var result = await _purchaseOrderService.UpdatePurchaseOrderAsync(999, dto);

            Assert.False(result);
        }

        [Fact]
        public async Task UpdatePurchaseOrderAsync_IdExists_UpdatesCustomerDescriptionStatus()
        {
            SeedTestData(_context);
            var order = _context.PurchaseOrders.First();

            var dto = new UpdatePurchaseOrderDto
            {
                CustomerName = "Updated Customer",
                Description = "Updated Description",
                Status = "Ordered",
                Products = new System.Collections.Generic.List<UpdatePurchaseOrderDetailDto>()
            };

            var result = await _purchaseOrderService.UpdatePurchaseOrderAsync(order.Id, dto);

            Assert.True(result);
            var updatedOrder = await _context.PurchaseOrders.FindAsync(order.Id);
            var updatedCustomer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == updatedOrder.CustomerId);

            Assert.Equal("Updated Description", updatedOrder.Description);
            Assert.Equal(PurchaseStatus.Ordered, updatedOrder.Status);
            Assert.Equal("Updated Customer", updatedCustomer.CustomerName);
        }

        [Fact]
        public async Task UpdatePurchaseOrderAsync_ValidStatus_UpdatesCorrectEnum()
        {
            SeedTestData(_context);
            var order = _context.PurchaseOrders.First();

            var dto = new UpdatePurchaseOrderDto
            {
                CustomerName = "Customer A",
                Description = "Desc",
                Status = "Imported",
                Products = new System.Collections.Generic.List<UpdatePurchaseOrderDetailDto>()
            };

            var result = await _purchaseOrderService.UpdatePurchaseOrderAsync(order.Id, dto);

            Assert.True(result);
            var updatedOrder = await _context.PurchaseOrders.FindAsync(order.Id);
            Assert.Equal(PurchaseStatus.Imported, updatedOrder.Status);
        }

        [Fact]
        public async Task UpdatePurchaseOrderAsync_InvalidStatus_ThrowsException()
        {
            SeedTestData(_context);
            var order = _context.PurchaseOrders.First();

            var dto = new UpdatePurchaseOrderDto
            {
                CustomerName = "Customer A",
                Description = "Desc",
                Status = "InvalidStatus",
                Products = new System.Collections.Generic.List<UpdatePurchaseOrderDetailDto>()
            };

            await Assert.ThrowsAsync<Exception>(async () =>
                await _purchaseOrderService.UpdatePurchaseOrderAsync(order.Id, dto)
            );
        }

        [Fact]
        public async Task UpdatePurchaseOrderAsync_ProductIdExists_DoesNotCreateNewProduct()
        {
            SeedTestData(_context);
            var order = _context.PurchaseOrders.First();
            var existingProduct = _context.Products.First();

            var dto = new UpdatePurchaseOrderDto
            {
                CustomerName = "Customer A",
                Description = "Desc",
                Status = "Pending",
                Products = new System.Collections.Generic.List<UpdatePurchaseOrderDetailDto>
                {
                    new UpdatePurchaseOrderDetailDto
                    {
                        ProductId = existingProduct.Id,
                        ProductName = existingProduct.ProductName,
                        Quantity = 5,
                        Width = 200,
                        Height = 300,
                        Thickness = 10
                    }
                }
            };

            var initialProductCount = _context.Products.Count();
            var result = await _purchaseOrderService.UpdatePurchaseOrderAsync(order.Id, dto);

            Assert.True(result);
            Assert.Equal(initialProductCount, _context.Products.Count());
        }

        [Fact]
        public async Task UpdatePurchaseOrderAsync_ProductIdNotExists_CreatesNewProduct()
        {
            SeedTestData(_context);
            var order = _context.PurchaseOrders.First();

            var dto = new UpdatePurchaseOrderDto
            {
                CustomerName = "Customer A",
                Description = "Desc",
                Status = "Pending",
                Products = new System.Collections.Generic.List<UpdatePurchaseOrderDetailDto>
                {
                    new UpdatePurchaseOrderDetailDto
                    {
                        ProductId = null,
                        ProductName = "New Product",
                        Quantity = 5,
                        Width = 200,
                        Height = 300,
                        Thickness = 10
                    }
                }
            };

            var initialProductCount = _context.Products.Count();
            var result = await _purchaseOrderService.UpdatePurchaseOrderAsync(order.Id, dto);

            Assert.True(result);
            Assert.Equal(initialProductCount + 1, _context.Products.Count());
            Assert.Contains(_context.Products, p => p.ProductName == "New Product");
        }

        //-------------------- CreateProductAsync ---------------------

        [Fact]
        public async Task CreateProductAsync_ProductNameIsNull_ThrowsException()
        {
            var dto = new CreateProductV3Dto
            {
                ProductName = "",
                UOM = "Tấm"
            };

            await Assert.ThrowsAsync<Exception>(() =>
                _purchaseOrderService.CreateProductAsync(dto)
            );
        }

        [Fact]
        public async Task CreateProductAsync_ValidName_CreatesProduct()
        {
            SeedTestData(_context);

            var dto = new CreateProductV3Dto
            {
                ProductName = "New Product",
                UOM = "Tấm",
                ProductType = "NVL",
                Width = "200",
                Height = "300",
                Thickness = 10,
                Weight = 15,
                UnitPrice = 50000
            };

            var product = await _purchaseOrderService.CreateProductAsync(dto);

            Assert.NotNull(product);
            Assert.Equal("New Product", product.ProductName);
            Assert.Equal("Tấm", product.UOM);
            Assert.Equal("NVL", product.ProductType);
        }

        [Fact]
        public async Task CreateProductAsync_DuplicateName_ThrowsException()
        {
            SeedTestData(_context);
            var existingProduct = _context.Products.First();

            var dto = new CreateProductV3Dto
            {
                ProductName = existingProduct.ProductName,
                UOM = "Tấm"
            };

            await Assert.ThrowsAsync<Exception>(() =>
                _purchaseOrderService.CreateProductAsync(dto)
            );
        }

        [Fact]
        public async Task CreateProductAsync_GlassStructureIdExists_CreatesWithValidId()
        {
            SeedTestData(_context);
            var validGlassId = _context.GlassStructures.First().Id;

            var dto = new CreateProductV3Dto
            {
                ProductName = "Product With Glass",
                UOM = "Tấm",
                GlassStructureId = validGlassId
            };

            var product = await _purchaseOrderService.CreateProductAsync(dto);

            Assert.NotNull(product);
            Assert.Equal(validGlassId, product.GlassStructureId);
        }

        [Fact]
        public async Task CreateProductAsync_GlassStructureIdNotExists_StillCreatesProduct()
        {
            SeedTestData(_context);

            var dto = new CreateProductV3Dto
            {
                ProductName = "Product Invalid Glass",
                UOM = "Tấm",
                GlassStructureId = 999
            };

            var product = await _purchaseOrderService.CreateProductAsync(dto);

            Assert.NotNull(product);
            Assert.Equal(999, product.GlassStructureId);
        }

        [Fact]
        public async Task CreateProductAsync_GlassStructureIdIsNegative_StillCreatesProduct()
        {
            SeedTestData(_context);

            var dto = new CreateProductV3Dto
            {
                ProductName = "Product Negative Glass",
                UOM = "Tấm",
                GlassStructureId = -1
            };

            var product = await _purchaseOrderService.CreateProductAsync(dto);

            Assert.NotNull(product);
            Assert.Equal(-1, product.GlassStructureId);
        }

        //-------------------- GetNextPurchaseOrderCode ---------------------

        [Fact]
        public void GetNextPurchaseOrderCode_NoPurchaseOrders_ReturnsMH00001()
        {
            var result = _purchaseOrderService.GetNextPurchaseOrderCode();

            Assert.Equal("MH00001", result);
        }

        [Fact]
        public void GetNextPurchaseOrderCode_HasMaxMH00005_ReturnsMH00006()
        {
            _context.PurchaseOrders.Add(new SEP490.DB.Models.PurchaseOrder { Id = 1, Code = "MH00003" });
            _context.PurchaseOrders.Add(new SEP490.DB.Models.PurchaseOrder { Id = 2, Code = "MH00005" });
            _context.PurchaseOrders.Add(new SEP490.DB.Models.PurchaseOrder { Id = 3, Code = "MH00002" });
            _context.SaveChanges();

            var result = _purchaseOrderService.GetNextPurchaseOrderCode();

            Assert.Equal("MH00006", result);
        }

        [Fact]
        public void GetNextPurchaseOrderCode_InvalidFormatCode_IgnoredAndReturnsCorrectNext()
        {
            _context.PurchaseOrders.Add(new SEP490.DB.Models.PurchaseOrder { Id = 1, Code = "MH00002" });
            _context.PurchaseOrders.Add(new SEP490.DB.Models.PurchaseOrder { Id = 2, Code = "ABC123" });
            _context.PurchaseOrders.Add(new SEP490.DB.Models.PurchaseOrder { Id = 3, Code = "MH00004" });
            _context.SaveChanges();

            var result = _purchaseOrderService.GetNextPurchaseOrderCode();

            Assert.Equal("MH00005", result);
        }

        //-------------------- UpdatePurchaseOrderStatusAsync ---------------------

        [Fact]
        public async Task UpdatePurchaseOrderStatusAsync_IdNotFound_ReturnsFalse()
        {
            var result = await _purchaseOrderService.UpdatePurchaseOrderStatusAsync(999, PurchaseStatus.Ordered);

            Assert.False(result);
        }

        [Fact]
        public async Task UpdatePurchaseOrderStatusAsync_IdExists_UpdatesStatusSuccessfully()
        {
            SeedTestData(_context);

            var result = await _purchaseOrderService.UpdatePurchaseOrderStatusAsync(1, PurchaseStatus.Ordered);

            Assert.True(result);

            var updatedOrder = await _context.PurchaseOrders.FindAsync(1);
            Assert.NotNull(updatedOrder);
            Assert.Equal(PurchaseStatus.Ordered, updatedOrder.Status);
        }

    }
}
