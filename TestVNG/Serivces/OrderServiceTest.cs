using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.Modules.OrderModule.ManageOrder.Services;
using System;
using System.Linq;
using TestVNG.Setup;
using Xunit;

namespace TestVNG.Services
{
    public class OrderServiceTest : TestBase
    {
        private readonly SEP490DbContext _context;
        private readonly OrderService _orderService;

        public OrderServiceTest()
        {
            _context = CreateInMemoryDbContext();
            _orderService = new OrderService(_context, null);

            SeedTestData(_context);
        }

        //-------------------- GetAllOrders ---------------------

        [Fact]
        public void GetAllOrders_ShouldReturnEmpty_WhenNoOrdersExist()
        {
            _context.SaleOrders.RemoveRange(_context.SaleOrders);
            _context.OrderDetails.RemoveRange(_context.OrderDetails);
            _context.OrderDetailProducts.RemoveRange(_context.OrderDetailProducts);
            _context.SaveChanges();

            var result = _orderService.GetAllOrders();

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public void GetAllOrders_ShouldNotIncludeOrder_WhenNoProducts()
        {
            var order = new SaleOrder
            {
                Id = 100,
                OrderCode = "ĐH00001",
                OrderDate = DateTime.Today,
                CustomerId = _context.Customers.First().Id,
                Status = Status.Pending,
                DeliveryStatus = DeliveryStatus.NotDelivered
            };
            var detail = new OrderDetail { Id = 200, SaleOrderId = 100 };
            _context.SaleOrders.Add(order);
            _context.OrderDetails.Add(detail);
            _context.SaveChanges();

            var result = _orderService.GetAllOrders();

            Assert.DoesNotContain(result, r => r.Id == 100);
        }


        [Fact]
        public void GetAllOrders_ShouldNotReturnOrder_WhenCustomerDoesNotExist()
        {
            var order = new SaleOrder
            {
                Id = 101,
                OrderCode = "ĐH00002",
                OrderDate = DateTime.Today,
                CustomerId = 999,
                Status = Status.Pending,
                DeliveryStatus = DeliveryStatus.NotDelivered
            };
            _context.SaleOrders.Add(order);

            var product = _context.Products.FirstOrDefault() ?? new Product
            {
                Id = 1,
                ProductCode = "PROD001",
                ProductName = "Product 1",
                UnitPrice = 100000
            };
            if (!_context.Products.Any()) _context.Products.Add(product);

            var detail = new OrderDetail { Id = 201, SaleOrderId = 101 };
            var odp = new OrderDetailProduct { OrderDetailId = 201, ProductId = product.Id, Quantity = 1 };

            _context.OrderDetails.Add(detail);
            _context.OrderDetailProducts.Add(odp);
            _context.SaveChanges();

            var result = _orderService.GetAllOrders();

            Assert.DoesNotContain(result, r => r.Id == 101);
        }


        [Fact]
        public void GetAllOrders_ShouldReturnOrders_WhenOrderHasCustomerAndProducts()
        {
            using var context = CreateInMemoryDbContext();
            var orderService = new OrderService(context, null);

            var customer = new Customer { Id = 1, CustomerName = "Customer A" };
            var product = new Product { Id = 1, ProductName = "Product A", UnitPrice = 100000 };
            context.Customers.Add(customer);
            context.Products.Add(product);
            context.SaveChanges();

            var order = new SaleOrder
            {
                Id = 102,
                OrderCode = "ĐH00003",
                OrderDate = DateTime.Today,
                CustomerId = customer.Id,
                Status = Status.Pending,
                DeliveryStatus = DeliveryStatus.NotDelivered
            };
            var detail = new OrderDetail { Id = 202, SaleOrderId = 102 };
            var odp = new OrderDetailProduct { OrderDetailId = 202, ProductId = product.Id, Quantity = 2 };

            context.SaleOrders.Add(order);
            context.OrderDetails.Add(detail);
            context.OrderDetailProducts.Add(odp);
            context.SaveChanges();

            var result = orderService.GetAllOrders();

            Assert.NotNull(result);
            Assert.Single(result);
            var orderDto = result.First();
            Assert.Equal("ĐH00003", orderDto.OrderCode);
            Assert.True(orderDto.OriginalTotalAmount > 0);
        }

        //-------------------- GetOrderDetailById ---------------------

        [Fact]
        public void GetOrderDetailById_ShouldReturnNull_WhenIdDoesNotExist()
        {
            var result = _orderService.GetOrderDetailById(999);

            Assert.Null(result);
        }

        [Fact]
        public void GetOrderDetailById_ShouldReturnCorrectInfo_WhenIdExistsWithOneProduct()
        {
            using var context = CreateInMemoryDbContext();
            var orderService = new OrderService(context, null);

            var customer = new Customer { Id = 1, CustomerName = "Customer A" };
            var product = new Product { Id = 1, ProductCode = "PROD001", ProductName = "Product A", Height = "200", Width = "100", Thickness = 5 };
            context.Customers.Add(customer);
            context.Products.Add(product);
            context.SaveChanges();

            var order = new SaleOrder { Id = 10, OrderCode = "ĐH00010", OrderDate = DateTime.Today, CustomerId = customer.Id, Status = Status.Pending, DeliveryStatus = DeliveryStatus.NotDelivered };
            var detail = new OrderDetail { Id = 20, SaleOrderId = 10 };
            var odp = new OrderDetailProduct { OrderDetailId = 20, ProductId = product.Id, Quantity = 2 };

            context.SaleOrders.Add(order);
            context.OrderDetails.Add(detail);
            context.OrderDetailProducts.Add(odp);
            context.SaveChanges();

            var result = orderService.GetOrderDetailById(10);

            Assert.NotNull(result);
            Assert.Equal("ĐH00010", result.OrderCode);
            Assert.Equal("Customer A", result.CustomerName);
            Assert.Single(result.Products);
            Assert.Equal("Product A", result.Products.First().ProductName);
        }

        [Fact]
        public void GetOrderDetailById_ShouldCalculateUnitPrice_WhenProductHasGlassStructure()
        {

            using var context = CreateInMemoryDbContext();
            var orderService = new OrderService(context, null);

            var customer = new Customer { Id = 1, CustomerName = "Customer A" };
            var glass = new GlassStructure { Id = 1, ProductCode = "GLS001", ProductName = "Glass A", UnitPrice = 200000 };
            var product = new Product { Id = 1, ProductCode = "PROD001", ProductName = "Product A", Height = "200", Width = "100", Thickness = 5, GlassStructureId = 1 };

            context.Customers.Add(customer);
            context.GlassStructures.Add(glass);
            context.Products.Add(product);
            context.SaveChanges();

            var order = new SaleOrder { Id = 11, OrderCode = "ĐH00011", OrderDate = DateTime.Today, CustomerId = customer.Id, Status = Status.Pending, DeliveryStatus = DeliveryStatus.NotDelivered };
            var detail = new OrderDetail { Id = 21, SaleOrderId = 11 };
            var odp = new OrderDetailProduct { OrderDetailId = 21, ProductId = product.Id, Quantity = 1 };

            context.SaleOrders.Add(order);
            context.OrderDetails.Add(detail);
            context.OrderDetailProducts.Add(odp);
            context.SaveChanges();

            var result = orderService.GetOrderDetailById(11);

            var productDto = result.Products.First();
            var expectedArea = (200m * 100m) / 1_000_000;
            var expectedUnitPrice = Math.Round(expectedArea * glass.UnitPrice.Value, 2);

            Assert.Equal(expectedUnitPrice, productDto.UnitPrice);
            Assert.True(productDto.UnitPrice > 0);
        }

        [Fact]
        public void GetOrderDetailById_ShouldSetUnitPriceZero_WhenProductHasNoGlassStructure()
        {
            using var context = CreateInMemoryDbContext();
            var orderService = new OrderService(context, null);

            var customer = new Customer { Id = 1, CustomerName = "Customer A" };
            var product = new Product { Id = 1, ProductCode = "PROD001", ProductName = "Product A", Height = "200", Width = "100", Thickness = 5, GlassStructureId = null };

            context.Customers.Add(customer);
            context.Products.Add(product);
            context.SaveChanges();

            var order = new SaleOrder { Id = 12, OrderCode = "ĐH00012", OrderDate = DateTime.Today, CustomerId = customer.Id, Status = Status.Pending, DeliveryStatus = DeliveryStatus.NotDelivered };
            var detail = new OrderDetail { Id = 22, SaleOrderId = 12 };
            var odp = new OrderDetailProduct { OrderDetailId = 22, ProductId = product.Id, Quantity = 1 };

            context.SaleOrders.Add(order);
            context.OrderDetails.Add(detail);
            context.OrderDetailProducts.Add(odp);
            context.SaveChanges();

            var result = orderService.GetOrderDetailById(12);

            var productDto = result.Products.First();
            Assert.Equal(0, productDto.UnitPrice);
            Assert.Equal(0, productDto.TotalAmount);
        }

        //-------------------- CreateOrderAsync ---------------------

        [Fact]
        public async Task CreateOrderAsync_ShouldCreateOrder_WhenCustomerExists()
        {
            var existingCustomer = _context.Customers.First();
            var product = _context.Products.First();

            var dto = new CreateOrderDto
            {
                CustomerName = existingCustomer.CustomerName,
                Phone = existingCustomer.Phone,
                Address = existingCustomer.Address ?? "Default Address",
                Discount = 0,
                OrderCode = "ĐH10001",
                OrderDate = DateTime.Today,
                Status = "Pending",
                Products = new List<CreateProductDto>
                {
                    new CreateProductDto
                    {
                        ProductId = product.Id,
                        ProductCode = product.ProductCode,
                        ProductName = product.ProductName,
                        Height = product.Height,
                        Width = product.Width,
                        Thickness = product.Thickness ?? 0,
                        Quantity = 2,
                        UnitPrice = product.UnitPrice ?? 0,
                        GlassStructureId = product.GlassStructureId
                    }
                }
            };

            var orderId = await _orderService.CreateOrderAsync(dto);

            Assert.True(orderId > 0);
            var order = _context.SaleOrders.FirstOrDefault(o => o.Id == orderId);
            Assert.NotNull(order);
            Assert.Equal(existingCustomer.Id, order.CustomerId);
        }

        [Fact]
        public async Task CreateOrderAsync_ShouldCreateCustomer_WhenCustomerDoesNotExist()
        {
            var product = _context.Products.First();
            var dto = new CreateOrderDto
            {
                CustomerName = "New Customer",
                Phone = "0909999999",
                Address = "123 Street",
                Discount = 0.05m,
                OrderCode = "ĐH10002",
                OrderDate = DateTime.Today,
                Status = "Pending",
                Products = new List<CreateProductDto>
                {
                    new CreateProductDto
                    {
                        ProductId = product.Id,
                        ProductCode = product.ProductCode,
                        ProductName = product.ProductName,
                        Height = product.Height,
                        Width = product.Width,
                        Thickness = product.Thickness ?? 0,
                        Quantity = 1,
                        UnitPrice = product.UnitPrice ?? 0,
                        GlassStructureId = product.GlassStructureId
                    }
                }
            };

            var orderId = await _orderService.CreateOrderAsync(dto);

            Assert.True(orderId > 0);
            var newCustomer = _context.Customers.FirstOrDefault(c => c.CustomerName == "New Customer");
            Assert.NotNull(newCustomer);
        }

        [Fact]
        public async Task CreateOrderAsync_ShouldThrow_WhenProductDoesNotExist()
        {
            var dto = new CreateOrderDto
            {
                CustomerName = "Customer A",
                Phone = "0908888888",
                Address = "123 Street",
                Discount = 0,
                OrderCode = "ĐH10003",
                OrderDate = DateTime.Today,
                Status = "Pending",
                Products = new List<CreateProductDto>
        {
            new CreateProductDto
            {
                ProductId = 999,
                ProductCode = "PROD999",
                ProductName = "Fake Product",
                Height = "200",
                Width = "100",
                Thickness = 5,
                Quantity = 1,
                UnitPrice = 100000
            }
        }
            };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(async () =>
            {
                await _orderService.CreateOrderAsync(dto);
            });

            Assert.Equal("Product with ID 999 not found", ex.Message);

        }


        [Fact]
        public async Task CreateOrderAsync_ShouldThrow_WhenCustomerDataInvalid()
        {
            var product = _context.Products.First();
            var dto = new CreateOrderDto
            {
                CustomerName = null,
                Phone = null,
                Address = "No Address",
                Discount = 0,
                OrderCode = "ĐH10004",
                OrderDate = DateTime.Today,
                Status = "Pending",
                Products = new List<CreateProductDto>
        {
            new CreateProductDto
            {
                ProductId = product.Id,
                ProductCode = product.ProductCode,
                ProductName = product.ProductName,
                Height = product.Height,
                Width = product.Width,
                Thickness = product.Thickness ?? 0,
                Quantity = 1,
                UnitPrice = product.UnitPrice ?? 0,
                GlassStructureId = product.GlassStructureId
            }
        }
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                _orderService.CreateOrderAsync(dto)
            );

            Assert.Equal("CustomerName is required", ex.Message);
        }

        [Fact]
        public async Task CreateOrderAsync_ShouldThrow_WhenProductsIsNull()
        {
            var dto = new CreateOrderDto
            {
                CustomerName = "Customer A",
                Phone = "0908888888",
                Address = "123 Street",
                Discount = 0,
                OrderCode = "ĐH10005",
                OrderDate = DateTime.Today,
                Status = "Pending",
                Products = null
            };

            await Assert.ThrowsAsync<ArgumentException>(async () =>
            {
                await _orderService.CreateOrderAsync(dto);
            });
        }

        [Fact]
        public async Task CreateOrderAsync_ShouldThrow_WhenCustomerAndProductDoNotExist()
        {
            var dto = new CreateOrderDto
            {
                CustomerName = "Unknown Customer",
                Phone = "0911111111",
                Address = "No Address",
                Discount = 0,
                OrderCode = "ĐH10005",
                OrderDate = DateTime.Today,
                Status = "Pending",
                Products = new List<CreateProductDto>
        {
            new CreateProductDto
            {
                ProductId = 999,
                ProductCode = "FAKE999",
                ProductName = "Fake Product",
                Height = "100",
                Width = "200",
                Thickness = 5,
                Quantity = 1,
                UnitPrice = 50000
            }
        }
            };

            await Assert.ThrowsAsync<InvalidOperationException>(async () =>
            {
                await _orderService.CreateOrderAsync(dto);
            });
        }

        //-------------------- CreateProductAsync ---------------------

        [Fact]
        public async Task CreateProductAsync_ShouldThrow_WhenProductNameExists()
        {
            var existingProduct = _context.Products.First();
            var dto = new CreateProductV2Dto
            {
                ProductName = existingProduct.ProductName,
                Height = "100",
                Width = "200",
                Thickness = 5,
                UnitPrice = 150000,
                GlassStructureId = 1
            };

            var ex = await Assert.ThrowsAsync<Exception>(() => _orderService.CreateProductAsync(dto));
            Assert.Equal("Tên sản phẩm đã tồn tại!", ex.Message);
        }

        [Fact]
        public async Task CreateProductAsync_ShouldThrow_WhenWidthOrHeightInvalid()
        {
            var dto = new CreateProductV2Dto
            {
                ProductName = "New Product",
                Height = "", 
                Width = "abc",
                Thickness = 5,
                UnitPrice = 150000,
                GlassStructureId = 1
            };

            var ex = await Assert.ThrowsAsync<Exception>(() => _orderService.CreateProductAsync(dto));
            Assert.Equal("Chiều rộng hoặc chiều cao không hợp lệ.", ex.Message);
        }


        [Fact]
        public async Task CreateProductAsync_ShouldThrow_WhenGlassStructureIdNotExist()
        {
            var dto = new CreateProductV2Dto
            {
                ProductName = "New Product",
                Height = "100",
                Width = "200",
                Thickness = 5,
                UnitPrice = 150000,
                GlassStructureId = 999
            };

            var ex = await Assert.ThrowsAsync<Exception>(() => _orderService.CreateProductAsync(dto));
            Assert.Equal("Cấu trúc kính không tồn tại hoặc chưa có đơn giá.", ex.Message);
        }


        [Fact]
        public async Task CreateProductAsync_ShouldCreate_WhenDataIsValid()
        {
            var dto = new CreateProductV2Dto
            {
                ProductName = "New Valid Product",
                Height = "100",
                Width = "200",
                Thickness = 5,
                UnitPrice = 150000,
                GlassStructureId = 1
            };

            var product = await _orderService.CreateProductAsync(dto);

            var productInDb = await _context.Products.FindAsync(product.Id);
            Assert.NotNull(productInDb);
            Assert.Equal(dto.ProductName, productInDb.ProductName);
            Assert.Equal(dto.Height, productInDb.Height);
            Assert.Equal(dto.Width, productInDb.Width);

        }

        //-------------------- UpdateOrderDetailById ---------------------

        [Fact]
        public void UpdateOrderDetailById_ShouldUpdate_WhenOrderExists()
        {
            var existingOrder = _context.SaleOrders.First();
            var product = _context.Products.First();

            var dto = new UpdateOrderDetailDto
            {
                CustomerName = "Updated Customer",
                Address = "Updated Address",
                Phone = "0909999999",
                Discount = 5,
                Status = "Pending",
                DeliveryStatus = "NotDelivered",
                Products = new List<UpdateProductDto>
                {
                    new UpdateProductDto
                    {
                        ProductId = product.Id,
                        ProductCode = product.ProductCode,
                        ProductName = "Updated Product Name",
                        Height = product.Height,
                        Width = product.Width,
                        Thickness = product.Thickness ?? 0,
                        UnitPrice = product.UnitPrice ?? 0,
                        Quantity = 3
                    }
                }
            };

            var result = _orderService.UpdateOrderDetailById(existingOrder.Id, dto);

            Assert.True(result);
            var updatedOrder = _context.SaleOrders.First(o => o.Id == existingOrder.Id);
            Assert.Equal("Updated Customer", updatedOrder.Customer.CustomerName);
            Assert.Equal(5, updatedOrder.Customer.Discount);
            Assert.Contains(updatedOrder.OrderDetails.First().OrderDetailProducts,
                odp => odp.Quantity == 3);
        }

        [Fact]
        public void UpdateOrderDetailById_ShouldReturnFalse_WhenOrderDoesNotExist()
        {
            var dto = new UpdateOrderDetailDto
            {
                CustomerName = "Test Customer",
                Products = new List<UpdateProductDto>()
            };

            var result = _orderService.UpdateOrderDetailById(9999, dto);

            Assert.False(result);
        }

        [Fact]
        public void UpdateOrderDetailById_ShouldReturnFalse_WhenOrderIdInvalid()
        {
            var dto = new UpdateOrderDetailDto
            {
                CustomerName = "Test Customer",
                Products = new List<UpdateProductDto>()
            };

            var result = _orderService.UpdateOrderDetailById(-1, dto);

            Assert.False(result);
        }

        [Fact]
        public void UpdateOrderDetailById_ShouldSkip_WhenProductDoesNotExist()
        {
            var existingOrder = _context.SaleOrders.First();
            var dto = new UpdateOrderDetailDto
            {
                CustomerName = "Test Customer",
                Products = new List<UpdateProductDto>
                {
                    new UpdateProductDto
                    {
                        ProductId = 9999,
                        ProductName = "Fake Product",
                        Quantity = 2
                    }
                }
            };

            var result = _orderService.UpdateOrderDetailById(existingOrder.Id, dto);

            Assert.True(result);
            var detail = _context.OrderDetails.First(od => od.SaleOrderId == existingOrder.Id);
            Assert.DoesNotContain(detail.OrderDetailProducts, odp => odp.ProductId == 9999);
        }

        [Fact]
        public void UpdateOrderDetailById_ShouldSkip_WhenProductIdIsZero()
        {
            var existingOrder = _context.SaleOrders.First();

            var dto = new UpdateOrderDetailDto
            {
                CustomerName = "Test Customer",
                Products = new List<UpdateProductDto>
                {
                    new UpdateProductDto
                    {
                        ProductId = 0,
                        ProductName = "Invalid Product",
                        Quantity = 1
                    }
                }
            };

            var result = _orderService.UpdateOrderDetailById(existingOrder.Id, dto);

            Assert.True(result);
            var detail = _context.OrderDetails.First(od => od.SaleOrderId == existingOrder.Id);
            Assert.DoesNotContain(detail.OrderDetailProducts, odp => odp.ProductId == 0);
        }

        [Fact]
        public void UpdateOrderDetailById_ShouldSetQuantityZero_WhenQuantityInvalid()
        {
            var existingOrder = _context.SaleOrders.First();
            var product = _context.Products.First();

            var dto = new UpdateOrderDetailDto
            {
                CustomerName = "Test Customer",
                Products = new List<UpdateProductDto>
                {
                    new UpdateProductDto
                    {
                        ProductId = product.Id,
                        ProductName = product.ProductName,
                        Quantity = -5
                    }
                }
            };

            var result = _orderService.UpdateOrderDetailById(existingOrder.Id, dto);

            Assert.True(result);
            var detail = _context.OrderDetails.First(od => od.SaleOrderId == existingOrder.Id);
            Assert.Contains(detail.OrderDetailProducts,
                odp => odp.ProductId == product.Id && odp.Quantity == -5);
        }

        [Fact]
        public void UpdateOrderDetailById_ShouldAllowNegativeDiscount()
        {
            var existingOrder = _context.SaleOrders.First();
            var dto = new UpdateOrderDetailDto
            {
                CustomerName = "Test Customer",
                Discount = -10,
                Products = new List<UpdateProductDto>()
            };

            var result = _orderService.UpdateOrderDetailById(existingOrder.Id, dto);

            Assert.True(result);
            var updatedOrder = _context.SaleOrders.First(o => o.Id == existingOrder.Id);
            Assert.Equal(-10, updatedOrder.Customer.Discount);
        }

        // -------------------- DeleteOrder ---------------------

        [Fact]
        public void DeleteOrder_ShouldThrow_WhenOrderDoesNotExist() 
        {
            var nonExistentOrderId = 999;

            var ex = Assert.Throws<Exception>(() => _orderService.DeleteOrder(nonExistentOrderId));
            Assert.Equal("Order not found", ex.Message);
        }

        [Fact]
        public void DeleteOrder_ShouldDeleteOrderAndRelatedDetails_WhenOrderHasDetailsAndProducts() 
        {
            var existingOrderId = 1;

            _orderService.DeleteOrder(existingOrderId);

            Assert.Null(_context.SaleOrders.FirstOrDefault(o => o.Id == existingOrderId));
            Assert.Empty(_context.OrderDetails.Where(od => od.SaleOrderId == existingOrderId));
            Assert.Empty(_context.OrderDetailProducts.Where(dp => dp.OrderDetailId == 1)); 
        }

        [Fact]
        public void DeleteOrder_ShouldDeleteOrderOnly_WhenOrderHasNoDetails() 
        {
            var order = new SaleOrder
            {
                Id = 300,
                OrderCode = "ĐH99999",
                OrderDate = DateTime.Today,
                CustomerId = _context.Customers.First().Id,
                Status = Status.Pending,
                DeliveryStatus = DeliveryStatus.NotDelivered
            };
            _context.SaleOrders.Add(order);
            _context.SaveChanges();

            _orderService.DeleteOrder(order.Id);

            Assert.Null(_context.SaleOrders.FirstOrDefault(o => o.Id == order.Id));
            Assert.Empty(_context.OrderDetails.Where(od => od.SaleOrderId == order.Id));
        }

        // -------------------- SearchCustomers ---------------------

        [Fact]
        public void SearchCustomers_ShouldReturnEmpty_WhenNoCustomersExist() 
        {
            _context.Customers.RemoveRange(_context.Customers);
            _context.SaveChanges();

            var result = _orderService.SearchCustomers("Customer");

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public void SearchCustomers_ShouldReturnMatchingCustomers_WhenKeywordMatches()
        {
            var customer = new Customer
            {
                Id = 100,
                CustomerCode = "CUST100",
                CustomerName = "Special Customer",
                IsSupplier = false
            };
            _context.Customers.Add(customer);
            _context.SaveChanges();

            var result = _orderService.SearchCustomers("Special");

            Assert.NotNull(result);
            Assert.Single(result);
            Assert.Equal("Special Customer", result.First().CustomerName);
            Assert.Equal("CUST100", result.First().CustomerCode);
        }

        [Fact]
        public void SearchCustomers_ShouldNotReturnSuppliers_WhenIsSupplierIsTrue() 
        {
            var supplier = new Customer
            {
                Id = 101,
                CustomerCode = "SUPP001",
                CustomerName = "Supplier X",
                IsSupplier = true
            };
            _context.Customers.Add(supplier);
            _context.SaveChanges();

            var result = _orderService.SearchCustomers("Supplier");

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        // -------------------- GetNextOrderCode ---------------------

        [Fact]
        public void GetNextOrderCode_ShouldReturnFirstCode_WhenNoOrdersExist()
        {
            _context.SaleOrders.RemoveRange(_context.SaleOrders);
            _context.SaveChanges();

            var result = _orderService.GetNextOrderCode();

            Assert.Equal("ĐH00001", result);
        }

        [Fact]
        public void GetNextOrderCode_ShouldReturnNextCode_WhenMaxCodeExists()
        {
            _context.SaleOrders.Add(new SaleOrder
            {
                Id = 100,
                OrderCode = "ĐH00010",
                OrderDate = DateTime.Today,
                CustomerId = 1,
                Status = Status.Pending,
                DeliveryStatus = DeliveryStatus.NotDelivered
            });
            _context.SaveChanges();

            var result = _orderService.GetNextOrderCode();

            Assert.Equal("ĐH00011", result);
        }

        [Fact]
        public void GetNextOrderCode_ShouldIgnoreInvalidCodes_WhenCalculatingNextCode() 
        {
            _context.SaleOrders.AddRange(
                new SaleOrder { Id = 101, OrderCode = "INVALID01", OrderDate = DateTime.Today, CustomerId = 1 },
                new SaleOrder { Id = 102, OrderCode = "ĐH00005", OrderDate = DateTime.Today, CustomerId = 1 },
                new SaleOrder { Id = 103, OrderCode = "TEST123", OrderDate = DateTime.Today, CustomerId = 1 }
            );
            _context.SaveChanges();

            var result = _orderService.GetNextOrderCode();

            Assert.Equal("ĐH00006", result);
        }

        // -------------------- GetAllGlassStructures ---------------------

        [Fact]
        public void GetAllGlassStructures_ShouldReturnEmpty_WhenNoGlassStructuresExist()
        {
            _context.GlassStructures.RemoveRange(_context.GlassStructures);
            _context.SaveChanges();

            var result = _orderService.GetAllGlassStructures();

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public void GetAllGlassStructures_ShouldReturnGlassStructures_WhenTheyExist() // TC36
        {
            _context.GlassStructures.RemoveRange(_context.GlassStructures);
            _context.GlassStructures.Add(new GlassStructure
            {
                Id = 10,
                ProductCode = "GLS001",
                ProductName = "Glass Test",
                UnitPrice = 150000
            });
            _context.SaveChanges();

            var result = _orderService.GetAllGlassStructures();

            Assert.NotNull(result);
            Assert.Single(result);
            var glass = result.First();
            Assert.Equal(10, glass.Id);
            Assert.Equal("GLS001", glass.ProductCode);
            Assert.Equal("Glass Test", glass.ProductName);
            Assert.Equal(150000, glass.UnitPrice);
        }

        // -------------------- UpdateOrderStatus ---------------------

        [Fact]
        public void UpdateOrderStatus_ShouldReturnFalse_WhenOrderDoesNotExist() 
        {
            int nonExistingOrderId = 999;
            int validStatus = (int)Status.Delivered;

            var result = _orderService.UpdateOrderStatus(nonExistingOrderId, validStatus);

            Assert.False(result);
        }

        [Fact]
        public void UpdateOrderStatus_ShouldUpdateSuccessfully_WhenStatusIsValid() 
        {
            var order = _context.SaleOrders.First();
            int orderId = order.Id;
            int validStatus = (int)Status.Delivered;

            var result = _orderService.UpdateOrderStatus(orderId, validStatus);

            Assert.True(result);

            var updatedOrder = _context.SaleOrders.First(o => o.Id == orderId);
            Assert.Equal(Status.Delivered, updatedOrder.Status);
        }

        [Fact]
        public void UpdateOrderStatus_ShouldReturnFalse_WhenStatusIsInvalid()
        {
            var order = _context.SaleOrders.First();
            int orderId = order.Id;
            int invalidStatus = 999;

            var result = _orderService.UpdateOrderStatus(orderId, invalidStatus);


            Assert.False(result);

            var updatedOrder = _context.SaleOrders.First(o => o.Id == orderId);
            Assert.NotEqual((Status)invalidStatus, updatedOrder.Status);
        }


    }
}
