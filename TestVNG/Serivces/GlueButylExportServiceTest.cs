using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.GlueButylExport.DTO;
using SEP490.Modules.GlueButylExport.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TestVNG.Setup;
using Xunit;

namespace TestVNG.Services
{
    public class GlueButylExportServiceTest : TestBase
    {
        private readonly SEP490DbContext _context;
        private readonly GlueButylExportService _service;

        public GlueButylExportServiceTest()
        {
            _context = CreateInMemoryDbContext();
            _service = new GlueButylExportService(_context);
        }

        //-------------------- AddGlueButylExport ---------------------

        [Fact]
        public async Task AddGlueButylExport_Success_ReturnsTrue()
        {
            // Arrange
            var productionOrder = new ProductionOrder
            {
                Id = 1,
                //ProductionOrderCode = "PO001",
                OrderDate = DateTime.UtcNow,
                Description = "Test",
                Type = "Test",
                //StatusDaNhapMisa = false,
                //ProductionPlanCode = "PLAN001",
                ProductionPlanId = 1,
                ProductionPlan = new ProductionPlan { Id = 1}
            };
            _context.ProductionOrders.Add(productionOrder);

            var productName = "Sản phẩm A";
            var output = new ProductionOutput
            {
                Id = 1,
                ProductName = productName,
                ProductionOrderId = 1,
                Finished = 0
            };
            _context.ProductionOutputs.Add(output);

            var dto = new CreateNewDTO
            {
                ProductionOrderId = 1,
                Products = new List<ProductsDTO>
                {
                    new ProductsDTO { Name = productName, Quantity = 5 }
                },
                EmployeeId = 1,
                Note = "Ghi chú"
            };

            _context.Employees.Add(new Employee { Id = 1, FullName = "NV A" });
            await _context.SaveChangesAsync();

            // Act
            await _service.AddGlueButylExport(dto);

            // Assert
            var invoice = _context.GlueButylExportInvoices.FirstOrDefault();
            var updatedOutput = _context.ProductionOutputs.FirstOrDefault();

            Assert.NotNull(invoice);
            Assert.Equal(5, updatedOutput?.Finished);
        }

        [Fact]
        public async Task AddGlueButylExport_ProductionOrderNotFound_ThrowsException()
        {
            // Arrange
            var dto = new CreateNewDTO
            {
                ProductionOrderId = 999, // không tồn tại
                Products = new List<ProductsDTO> { new ProductsDTO { Name = "SP", Quantity = 2 } },
                EmployeeId = 1,
                Note = "Ghi chú"
            };

            // Act + Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.AddGlueButylExport(dto));
            Assert.Equal("Production order not found.", ex.Message);
        }

        [Fact]
        public async Task AddGlueButylExport_ProductOutputNotFound_ThrowsException()
        {
            // Arrange
            var productionOrder = new ProductionOrder
            {
                Id = 2,
                //ProductionOrderCode = "PO002",
                OrderDate = DateTime.UtcNow,
                Description = "Test",
                Type = "Test",
                //StatusDaNhapMisa = false,
                //ProductionPlanCode = "PLAN002",
                ProductionPlanId = 2,
                ProductionPlan = new ProductionPlan { Id = 2 }
            };
            _context.ProductionOrders.Add(productionOrder);
            await _context.SaveChangesAsync();

            var dto = new CreateNewDTO
            {
                ProductionOrderId = 2,
                Products = new List<ProductsDTO> { new ProductsDTO { Name = "Không tồn tại", Quantity = 1 } },
                EmployeeId = 1,
                Note = "Ghi chú"
            };

            // Act + Assert
            var ex = await Assert.ThrowsAsync<Exception>(() => _service.AddGlueButylExport(dto));
            Assert.Equal("Production output for product Không tồn tại not found.", ex.Message);
        }

        [Fact]
        public async Task AddGlueButylExport_ProductQuantityZero_DoesNotUpdateOutput()
        {
            // Arrange
            var productionOrder = new ProductionOrder
            {
                Id = 3,
                //ProductionOrderCode = "PO003",
                OrderDate = DateTime.UtcNow,
                Description = "Test",
                Type = "Test",
                //StatusDaNhapMisa = false,
                //ProductionPlanCode = "PLAN003",
                ProductionPlanId = 3,
                ProductionPlan = new ProductionPlan { Id = 3 }
            };
            _context.ProductionOrders.Add(productionOrder);

            var productName = "SP0";
            _context.ProductionOutputs.Add(new ProductionOutput
            {
                Id = 3,
                ProductName = productName,
                ProductionOrderId = 3,
                Finished = 10
            });

            _context.Employees.Add(new Employee { Id = 1, FullName = "NV B" });
            await _context.SaveChangesAsync();

            var dto = new CreateNewDTO
            {
                ProductionOrderId = 3,
                Products = new List<ProductsDTO> { new ProductsDTO { Name = productName, Quantity = 0 } },
                EmployeeId = 1,
                Note = "Test"
            };

            // Act
            await _service.AddGlueButylExport(dto);

            // Assert
            var updatedOutput = _context.ProductionOutputs.FirstOrDefault(x => x.ProductName == productName);
            Assert.Equal(10, updatedOutput?.Finished); // Không thay đổi
        }

        [Fact]
        public async Task AddGlueButylExport_ValidData_ShouldPass()
        {
            var productionOrder = new ProductionOrder
            {
                Id = 10,
                //ProductionOrderCode = "PO123",
                OrderDate = DateTime.UtcNow,
                Description = "Sample PO",
                Type = "Normal",
                //StatusDaNhapMisa = false,
                ProductionPlanId = 10,
                //ProductionPlanCode = "Plan01"
            };
            _context.ProductionOrders.Add(productionOrder);

            _context.ProductionOutputs.Add(new ProductionOutput
            {
                Id = 10,
                ProductName = "Product 1",
                ProductionOrderId = 10,
                Finished = 0
            });

            _context.Employees.Add(new Employee { Id = 1, FullName = "NV Test" });
            await _context.SaveChangesAsync();

            var dto = new CreateNewDTO
            {
                ProductionOrderId = 10,
                EmployeeId = 1,
                Note = "Valid Export",
                Products = new List<ProductsDTO>
                {
                    new ProductsDTO
                    {
                        Name = "Product 1",
                        Quantity = 5
                    }
                }
            };

            await _service.AddGlueButylExport(dto);

            var export = await _context.GlueButylExportInvoices.FindAsync(1);
            Assert.NotNull(export);
        }

        [Fact]
        public async Task AddGlueButylExport_InvalidProductionOrder_ShouldThrow()
        {
            var dto = new CreateNewDTO
            {
                ProductionOrderId = 9999,
                EmployeeId = 1,
                Note = "Invalid PO",
                Products = new List<ProductsDTO>
                {
                    new ProductsDTO { Name = "Product 1", Quantity = 5 }
                }
            };

            await Assert.ThrowsAsync<Exception>(() => _service.AddGlueButylExport(dto));
        }

        [Fact]
        public async Task AddGlueButylExport_ProductionOutputNotFound_ShouldThrow()
        {
            var productionOrder = new ProductionOrder
            {
                Id = 20,
                //ProductionOrderCode = "PO999",
                OrderDate = DateTime.UtcNow,
                Type = "Test",
                //StatusDaNhapMisa = false,
                ProductionPlanId = 20,
                //ProductionPlanCode = "Plan99"
            };

            _context.ProductionOrders.Add(productionOrder);
            _context.Employees.Add(new Employee { Id = 1, FullName = "NV C" });
            await _context.SaveChangesAsync();

            var dto = new CreateNewDTO
            {
                ProductionOrderId = 20,
                EmployeeId = 1,
                Note = "Missing Output",
                Products = new List<ProductsDTO>
                {
                    new ProductsDTO { Name = "NonExistingProduct", Quantity = 5 }
                }
            };

            await Assert.ThrowsAsync<Exception>(() => _service.AddGlueButylExport(dto));
        }

        [Fact]
        public async Task AddGlueButylExport_ProductQuantityZero_ShouldPass()
        {
            var productionOrder = new ProductionOrder
            {
                Id = 30,
                //ProductionOrderCode = "PO888",
                OrderDate = DateTime.UtcNow,
                Type = "Test",
                //StatusDaNhapMisa = false,
                ProductionPlanId = 30,
                //ProductionPlanCode = "Plan888"
            };

            _context.ProductionOrders.Add(productionOrder);
            _context.ProductionOutputs.Add(new ProductionOutput
            {
                Id = 30,
                ProductName = "Product 1",
                ProductionOrderId = 30,
                Finished = 3
            });

            _context.Employees.Add(new Employee { Id = 1, FullName = "NV D" });
            await _context.SaveChangesAsync();

            var dto = new CreateNewDTO
            {
                ProductionOrderId = 30,
                EmployeeId = 1,
                Note = "Zero Quantity",
                Products = new List<ProductsDTO>
                {
                    new ProductsDTO { Name = "Product 1", Quantity = 0 }
                }
            };

            await _service.AddGlueButylExport(dto);

            var export = await _context.GlueButylExportInvoices.FirstOrDefaultAsync();
            Assert.NotNull(export);
        }
    }
}
