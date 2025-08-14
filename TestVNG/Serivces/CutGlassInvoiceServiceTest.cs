using FluentAssertions.Common;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Modules.ProductionOrders.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TestVNG.Setup;

namespace TestVNG.Serivces
{
    public class CutGlassInvoiceServiceTest : TestBase
    {
        private readonly CuttingGlassManagementService _cuttingGlassManagementService;
        private readonly SEP490DbContext _context;
        public CutGlassInvoiceServiceTest()
        {
            _context = CreateInMemoryDbContext();
            _cuttingGlassManagementService = new CuttingGlassManagementService(_context);

            SeedTestData(_context);
        }

        //-------------------- GetThanhPhamProductsAsync ---------------------

        [Fact]
        public async Task GetThanhPhamProductsAsync_NoProducts_ReturnsEmptyList()
        {
            _context.Products.RemoveRange(_context.Products);
            await _context.SaveChangesAsync();

            var result = await _cuttingGlassManagementService.GetThanhPhamProductsAsync();

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetThanhPhamProductsAsync_OnlyNonThanhPhamProducts_ReturnsEmptyList()
        {
            var thanhPhamProducts = _context.Products.Where(p => p.ProductType == "Thành phẩm").ToList();
            _context.Products.RemoveRange(thanhPhamProducts);
            await _context.SaveChangesAsync();

            var result = await _cuttingGlassManagementService.GetThanhPhamProductsAsync();

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetThanhPhamProductsAsync_HasThanhPhamProducts_ReturnsCorrectCount()
        {
            var result = await _cuttingGlassManagementService.GetThanhPhamProductsAsync();

            Assert.NotNull(result);
            var expectedCount = _context.Products.Count(p => p.ProductType == "Thành phẩm");
            Assert.Equal(expectedCount, result.Count);
            Assert.All(result, p => Assert.Equal("Thành phẩm", p.ProductType));
        }

        //-------------------- CreateProductAsync ---------------------

        [Fact]
        public async Task CreateProductAsync_CodeIsNull_StillCreatesSuccessfully()
        {
            var dto = new CreateProductionProductDto
            {
                ProductCode = null,
                ProductName = "New Product",
                ProductType = "Thành phẩm",
                UOM = "Tấm"
            };

            var result = await _cuttingGlassManagementService.CreateProductAsync(dto);

            Assert.NotNull(result);
            Assert.Equal("New Product", result.ProductName);
            Assert.Equal("Thành phẩm", result.ProductType);
        }

        [Fact]
        public async Task CreateProductAsync_NameIsNull_ThrowsException()
        {
            var dto = new CreateProductionProductDto
            {
                ProductCode = "P001",
                ProductName = null,
                ProductType = "Thành phẩm",
                UOM = "Tấm"
            };

            var ex = await Assert.ThrowsAsync<Exception>(() => _cuttingGlassManagementService.CreateProductAsync(dto));
            Assert.Equal("Tên sản phẩm không được để trống.", ex.Message);
        }

        [Fact]
        public async Task CreateProductAsync_NameIsDuplicated_ThrowsException()
        {
            var dto = new CreateProductionProductDto
            {
                ProductCode = "P002",
                ProductName = "Product 1", // Đã có trong TestData
                ProductType = "Thành phẩm",
                UOM = "Tấm"
            };

            var ex = await Assert.ThrowsAsync<Exception>(() => _cuttingGlassManagementService.CreateProductAsync(dto));
            Assert.Equal("Tên sản phẩm đã tồn tại.", ex.Message);
        }

        [Fact]
        public async Task CreateProductAsync_NameIsValid_CreatesSuccessfully()
        {
            var dto = new CreateProductionProductDto
            {
                ProductCode = "P003",
                ProductName = "Unique Product",
                ProductType = "Thành phẩm",
                UOM = "Tấm"
            };

            var result = await _cuttingGlassManagementService.CreateProductAsync(dto);

            Assert.NotNull(result);
            Assert.Equal("Unique Product", result.ProductName);
        }

        [Fact]
        public async Task CreateProductAsync_UOMIsNull_ThrowsException()
        {
            var dto = new CreateProductionProductDto
            {
                ProductCode = "P004",
                ProductName = "Test UOM Null",
                ProductType = "Thành phẩm",
                UOM = null
            };

            var ex = await Assert.ThrowsAsync<Exception>(() => _cuttingGlassManagementService.CreateProductAsync(dto));
            Assert.Equal("Đơn vị tính không được để trống.", ex.Message);
        }

        [Fact]
        public async Task CreateProductAsync_TypeIsInvalid_ThrowsException()
        {
            var dto = new CreateProductionProductDto
            {
                ProductCode = "P005",
                ProductName = "Wrong Type Product",
                ProductType = "Nguyên liệu",
                UOM = "Tấm"
            };

            var ex = await Assert.ThrowsAsync<Exception>(() => _cuttingGlassManagementService.CreateProductAsync(dto));
            Assert.Equal("Chỉ được tạo sản phẩm loại 'Thành phẩm'.", ex.Message);
        }

        [Fact]
        public async Task CreateProductAsync_AllValidFields_CreatesSuccessfully()
        {
            var dto = new CreateProductionProductDto
            {
                ProductCode = "P006",
                ProductName = "Valid Product",
                ProductType = "Thành phẩm",
                UOM = "Tấm"
            };

            var result = await _cuttingGlassManagementService.CreateProductAsync(dto);

            Assert.NotNull(result);
            Assert.Equal("Valid Product", result.ProductName);
            Assert.Equal("Tấm", result.UOM);
            Assert.Equal("Thành phẩm", result.ProductType);
        }

        //-------------------- CreateProductionOutputAsync ---------------------

        [Fact]
        public async Task CreateProductionOutputAsync_WithValidProductIdAndAmount_CreatesSuccessfully()
        {
            var dto = new CreateProductionOutputDto
            {
                ProductId = 1,
                Amount = 10,
                ProductionOrderId = null
            };

            var result = await _cuttingGlassManagementService.CreateProductionOutputAsync(dto);

            Assert.NotNull(result);
            Assert.Equal(dto.ProductId, result.ProductId);
            Assert.Equal(dto.Amount, result.Amount);
            Assert.Null(result.ProductionOrderId);
        }

        [Fact]
        public async Task CreateProductionOutputAsync_WithNonExistingProductId_ThrowsException()
        {
            var dto = new CreateProductionOutputDto
            {
                ProductId = 9999,
                Amount = 5,
                ProductionOrderId = null
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                _cuttingGlassManagementService.CreateProductionOutputAsync(dto));

            Assert.Equal("ProductId does not exist.", ex.Message);
        }

        [Fact]
        public async Task CreateProductionOutputAsync_WithInvalidAmount_ThrowsException()
        {
            var dto = new CreateProductionOutputDto
            {
                ProductId = 1, 
                Amount = 0, 
                ProductionOrderId = null
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                _cuttingGlassManagementService.CreateProductionOutputAsync(dto));

            Assert.Equal("Amount must be greater than 0.", ex.Message);
        }

        [Fact]
        public async Task CreateProductionOutputAsync_WithNegativeAmount_ThrowsException()
        {
            var dto = new CreateProductionOutputDto
            {
                ProductId = 1,
                Amount = -5,
                ProductionOrderId = null
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                _cuttingGlassManagementService.CreateProductionOutputAsync(dto));

            Assert.Equal("Amount must be greater than 0.", ex.Message);
        }

        [Fact]
        public async Task CreateProductionOutputAsync_WithValidProductionOrderId_CreatesSuccessfully()
        {
            var productionOrder = new ProductionOrder
            {
                Id = 999,
                Status = ProductionStatus.Pending
            };

            _context.ProductionOrders.Add(productionOrder);
            await _context.SaveChangesAsync();

            var dto = new CreateProductionOutputDto
            {
                ProductId = 1,
                Amount = 10,
                ProductionOrderId = 999
            };

            var result = await _cuttingGlassManagementService.CreateProductionOutputAsync(dto);

            Assert.NotNull(result);
            Assert.Equal(999, result.ProductionOrderId);
        }

        [Fact]
        public async Task CreateProductionOutputAsync_WithNonExistingProductionOrderId_ThrowsArgumentException()
        {
            var dto = new CreateProductionOutputDto
            {
                ProductId = 1,
                Amount = 10,
                ProductionOrderId = 55555
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                _cuttingGlassManagementService.CreateProductionOutputAsync(dto));

            Assert.Equal("ProductionOrderId does not exist.", ex.Message);
        }

        //-------------------- CreateMaterialAsync ---------------------

        [Fact]
        public async Task CreateMaterialAsync_ValidMaterial_ShouldSaveSuccessfully()
        {
            var material = new CutGlassInvoiceMaterial
            {
                productId = 1,
                quantity = 10,
                productionOrderId = 1
            };

            var result = await _cuttingGlassManagementService.CreateMaterialAsync(material);

            Assert.NotNull(result);
            Assert.True(result.Id > 0);
            Assert.Equal(10, result.quantity);
            Assert.Equal(1, result.productId);
            Assert.Equal(1, result.productionOrderId);
            Assert.True((DateTime.Now - result.CreatedAt).TotalSeconds < 5);
            Assert.True((DateTime.Now - result.UpdatedAt).TotalSeconds < 5);
        }

        [Fact]
        public async Task CreateMaterialAsync_QuantityZero_ShouldThrowException_IfRuleExists()
        {
            var material = new CutGlassInvoiceMaterial
            {
                productId = 1,
                quantity = 0,
                productionOrderId = 1
            };

            await Assert.ThrowsAsync<ArgumentException>(() =>
                _cuttingGlassManagementService.CreateMaterialAsync(material));
        }

        [Fact]
        public async Task CreateMaterialAsync_InvalidProductionOrderId_ShouldStillSave_IfNoFK()
        {
            var material = new CutGlassInvoiceMaterial
            {
                productId = 1,
                quantity = 5,
                productionOrderId = 9999 
            };

            var result = await _cuttingGlassManagementService.CreateMaterialAsync(material);

            Assert.NotNull(result);
            Assert.Equal(9999, result.productionOrderId);
        }

        //-------------------- UpdateMaterialAsync ---------------------

        [Fact]
        public async Task UpdateMaterial_ValidId_ValidQuantity_ValidNote_ShouldReturnUpdatedMaterial()
        {
            // Arrange
            var material = new CutGlassInvoiceMaterial
            {
                Id = 1,
                productId = 1,
                productionOrderId = 1,
                quantity = 5,
                note = "Old note",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            _context.CutGlassInvoiceMaterials.Add(material);
            await _context.SaveChangesAsync();

            var dto = new UpdateMaterialDto
            {
                Quantity = 10,
                Note = "Updated note"
            };

            // Act
            var result = await _cuttingGlassManagementService.UpdateMaterialAsync(1, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(10, result.quantity);
            Assert.Equal("Updated note", result.note);
        }

        [Fact]
        public async Task UpdateMaterial_ValidId_ValidQuantity_NullNote_ShouldReturnUpdatedMaterial()
        {
            // Arrange
            var material = new CutGlassInvoiceMaterial
            {
                Id = 2,
                productId = 1,
                productionOrderId = 1,
                quantity = 3,
                note = "Initial",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            _context.CutGlassInvoiceMaterials.Add(material);
            await _context.SaveChangesAsync();

            var dto = new UpdateMaterialDto
            {
                Quantity = 15,
                Note = null
            };

            // Act
            var result = await _cuttingGlassManagementService.UpdateMaterialAsync(2, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(15, result.quantity);
            Assert.Null(result.note);
        }

        [Fact]
        public async Task UpdateMaterial_ValidId_QuantityZero_ShouldStillReturnUpdatedMaterial()
        {
            // Arrange
            var material = new CutGlassInvoiceMaterial
            {
                Id = 3,
                productId = 1,
                productionOrderId = 1,
                quantity = 1,
                note = "Before zero",
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            _context.CutGlassInvoiceMaterials.Add(material);
            await _context.SaveChangesAsync();

            var dto = new UpdateMaterialDto
            {
                Quantity = 0,
                Note = "Set to zero"
            };

            // Act
            var result = await _cuttingGlassManagementService.UpdateMaterialAsync(3, dto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(0, result.quantity);
            Assert.Equal("Set to zero", result.note);
        }

        [Fact]
        public async Task UpdateMaterial_InvalidId_ShouldThrowException()
        {
            // Arrange: Không seed gì cả
            var dto = new UpdateMaterialDto
            {
                Quantity = 99,
                Note = "Should fail"
            };

            // Act + Assert
            await Assert.ThrowsAsync<Exception>(async () =>
            {
                await _cuttingGlassManagementService.UpdateMaterialAsync(999, dto);
            });
        }

        //-------------------- DeleteMaterialAsync ---------------------

        [Fact]
        public async Task DeleteMaterialAsync_ValidId_ShouldDelete()
        {
            // Arrange - tạo material có id = 1001
            var material = new CutGlassInvoiceMaterial
            {
                Id = 1001,
                productId = 1,
                productionOrderId = 1,
                quantity = 5,
                note = "Test Material"
            };

            _context.CutGlassInvoiceMaterials.Add(material);
            await _context.SaveChangesAsync();

            await _cuttingGlassManagementService.DeleteMaterialAsync(1001);

            var deleted = await _context.CutGlassInvoiceMaterials.FindAsync(1001);
            Assert.Null(deleted);
        }

        [Fact]
        public async Task DeleteMaterialAsync_InvalidId_ShouldThrow()
        {
            await Assert.ThrowsAsync<Exception>(async () =>
            {
                await _cuttingGlassManagementService.DeleteMaterialAsync(9999);
            });
        }
    }
}
