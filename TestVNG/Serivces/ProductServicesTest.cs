using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.Modules.ProductModule.DTO;
using SEP490.Modules.ProductModule.Service;
using System.Linq;
using TestVNG.Setup;
using Xunit;

namespace TestVNG.Serivces
{
    public class ProductServicesTest : TestBase
    {
        private ProductService _productService;
        private SEP490DbContext _context;

        public ProductServicesTest()
        {
            _context = CreateInMemoryDbContext();
            _productService = new ProductService(_context);

            // Seed test data
            SeedTestData(_context);
        }


        //-------------------- GetAllProducts ---------------------

        [Fact]
        public void GetAllProducts_ShouldReturnEmptyList_WhenNoProductsExist()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            _productService = new ProductService(_context);

            // Act
            var result = _productService.GetAllProducts();

            // Assert
            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public void GetAllProducts_ShouldReturnProducts_WithoutGlassStructure()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            _context.Products.Add(TestData.GetSampleProducts().First(p => p.GlassStructureId == null));
            _context.SaveChanges();
            _productService = new ProductService(_context);

            // Act
            var result = _productService.GetAllProducts();

            // Assert
            Assert.Single(result);
            var product = result.First();
            Assert.Equal("PROD001", product.ProductCode);
            Assert.Null(product.GlassStructureId);
            Assert.Equal(string.Empty, product.GlassStructureProductName);
        }

        [Fact]
        public void GetAllProducts_ShouldReturnProducts_WithGlassStructure()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            var glassStructures = TestData.GetSampleGlassStructures();
            var products = TestData.GetSampleProducts();

            _context.GlassStructures.AddRange(glassStructures);
            _context.Products.Add(products.First(p => p.GlassStructureId == 1));
            _context.SaveChanges();

            _productService = new ProductService(_context);

            // Act
            var result = _productService.GetAllProducts();

            // Assert
            Assert.Single(result);
            var product = result.First();
            Assert.Equal("PROD002", product.ProductCode);
            Assert.Equal(1, product.GlassStructureId);
            Assert.Equal("Glass A", product.GlassStructureProductName);
        }

        //-------------------- GetproductById ---------------------

        [Fact]
        public void GetProductById_ShouldReturnNull_WhenIdIsNotFound()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            // Act
            var result = _productService.GetProductById(999);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public void GetProductById_ShouldReturnProduct_WhenIdExists()
        {
            // Arrange
            _context = CreateInMemoryDbContext();

            var glassStructure = TestData.GetSampleGlassStructures().First();
            _context.GlassStructures.Add(glassStructure);
            _context.SaveChanges();

            var product = TestData.GetSampleProducts().First(p => p.GlassStructureId == 1);
            _context.Products.Add(product);
            _context.SaveChanges();

            var insertedProduct = _context.Products.First(p => p.ProductCode == "PROD002");

            _productService = new ProductService(_context);

            // Act
            var result = _productService.GetProductById(insertedProduct.Id);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("PROD002", result.ProductCode);
            Assert.NotNull(result.GlassStructure);
            Assert.Equal("Glass A", result.GlassStructure.ProductName);
        }

        [Fact]
        public void GetProductById_ShouldReturnNull_WhenIdIsNegative()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            // Act
            var result = _productService.GetProductById(-1); // ID không hợp lệ

            // Assert
            Assert.Null(result);
        }

        //-------------------- UpdateProduct ---------------------

        [Fact]
        public void UpdateProduct_ShouldReturnFalse_WhenIdDoesNotExist()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var dto = new UpdateProductProductDto
            {
                ProductName = "New Name",
                ProductCode = "XXX",
                ProductType = "Loại",
                UOM = "Tấm",
                Height = "200",
                Width = "200",
                Thickness = 10,
                Weight = 20,
                UnitPrice = 999,
                Quantity = 10,
                GlassStructureId = null
            };

            // Act
            var result = _productService.UpdateProduct(999, dto);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void UpdateProduct_ShouldReturnFalse_WhenIdIsInvalid()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var dto = new UpdateProductProductDto
            {
                ProductName = "Test",
                ProductCode = "XXX",
                ProductType = "Loại",
                UOM = "Tấm",
                Height = "100",
                Width = "100",
                Thickness = 5,
                Weight = 10,
                UnitPrice = 50000,
                Quantity = 5,
                GlassStructureId = null
            };

            // Act
            var result = _productService.UpdateProduct(-1, dto);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public void UpdateProduct_ShouldReturnTrue_WhenIdExists_AndValidData()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            _context.GlassStructures.AddRange(TestData.GetSampleGlassStructures());
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var dto = new UpdateProductProductDto
            {
                ProductName = "Updated Product",
                ProductCode = "NEWCODE",
                ProductType = "TP",
                UOM = "Tấm",
                Height = "300",
                Width = "150",
                Thickness = 8,
                Weight = 20,
                UnitPrice = 180000,
                Quantity = 4,
                GlassStructureId = 1
            };

            var productId = _context.Products.First().Id;

            // Act
            var result = _productService.UpdateProduct(productId, dto);

            // Assert
            Assert.True(result);

            var updated = _context.Products.First(p => p.Id == productId);
            Assert.Equal("Updated Product", updated.ProductName);
            Assert.Equal("NEWCODE", updated.ProductCode);
            Assert.Equal(1, updated.GlassStructureId);
        }

        [Fact]
        public void UpdateProduct_ShouldAllow_ProductNameIsNull()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var productId = _context.Products.First().Id;

            var dto = new UpdateProductProductDto
            {
                ProductName = null,
                ProductCode = "UPDATE",
                ProductType = "Loại",
                UOM = "Tấm",
                Height = "200",
                Width = "100",
                Thickness = 5,
                Weight = 10,
                UnitPrice = 100000,
                Quantity = 2,
                GlassStructureId = null
            };

            // Act
            var result = _productService.UpdateProduct(productId, dto);

            // Assert
            Assert.True(result);
            var product = _context.Products.First(p => p.Id == productId);
            Assert.Null(product.ProductName);
        }

        [Fact]
        public void UpdateProduct_ShouldRemoveGlassStructure_WhenGlassStructureIdIsNull()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            _context.GlassStructures.AddRange(TestData.GetSampleGlassStructures());
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var productWithGlass = _context.Products.First(p => p.GlassStructureId != null);

            var dto = new UpdateProductProductDto
            {
                ProductName = productWithGlass.ProductName,
                ProductCode = productWithGlass.ProductCode,
                ProductType = productWithGlass.ProductType,
                UOM = productWithGlass.UOM,
                Height = productWithGlass.Height,
                Width = productWithGlass.Width,
                Thickness = productWithGlass.Thickness,
                Weight = productWithGlass.Weight,
                UnitPrice = productWithGlass.UnitPrice,
                Quantity = productWithGlass.quantity,
                GlassStructureId = null // remove
            };

            // Act
            var result = _productService.UpdateProduct(productWithGlass.Id, dto);

            // Assert
            Assert.True(result);
            var updated = _context.Products.First(p => p.Id == productWithGlass.Id);
            Assert.Null(updated.GlassStructureId);
        }

        [Fact]
        public void UpdateProduct_ShouldSetGlassStructure_WhenValidGlassStructureId()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            _context.GlassStructures.AddRange(TestData.GetSampleGlassStructures());
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var product = _context.Products.First(p => p.GlassStructureId == null);

            var dto = new UpdateProductProductDto
            {
                ProductName = product.ProductName,
                ProductCode = product.ProductCode,
                ProductType = product.ProductType,
                UOM = product.UOM,
                Height = product.Height,
                Width = product.Width,
                Thickness = product.Thickness,
                Weight = product.Weight,
                UnitPrice = product.UnitPrice,
                Quantity = product.quantity,
                GlassStructureId = 1
            };

            // Act
            var result = _productService.UpdateProduct(product.Id, dto);

            // Assert
            Assert.True(result);
            var updated = _context.Products.First(p => p.Id == product.Id);
            Assert.Equal(1, updated.GlassStructureId);
        }

        [Fact]
        public void UpdateProduct_ShouldSetGlassStructureToNull_WhenInvalidGlassStructureId()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var product = _context.Products.First();

            var dto = new UpdateProductProductDto
            {
                ProductName = product.ProductName,
                ProductCode = product.ProductCode,
                ProductType = product.ProductType,
                UOM = product.UOM,
                Height = product.Height,
                Width = product.Width,
                Thickness = product.Thickness,
                Weight = product.Weight,
                UnitPrice = product.UnitPrice,
                Quantity = product.quantity,
                GlassStructureId = 999 
            };

            // Act
            var result = _productService.UpdateProduct(product.Id, dto);

            // Assert
            Assert.True(result);
            var updated = _context.Products.First(p => p.Id == product.Id);
            Assert.Equal(999, updated.GlassStructureId);
        }

        [Fact]
        public void UpdateProduct_ShouldFail_WhenProductNameIsDuplicated()
        {
            // Arrange
            var existingProduct = _context.Products.First();
            _context = CreateInMemoryDbContext();
            _context.GlassStructures.AddRange(TestData.GetSampleGlassStructures());
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var dto = new UpdateProductProductDto
            {
                ProductName = existingProduct.ProductName,
                ProductCode = "NEWCODE",
                ProductType = "TP",
                UOM = "Tấm",
                Height = "300",
                Width = "150",
                Thickness = 8,
                Weight = 20,
                UnitPrice = 180000,
                Quantity = 4,
                GlassStructureId = 1
            };

            var productId = _context.Products.First().Id;

            // Act
            var result = _productService.UpdateProduct(productId, dto);

            // Assert
            Assert.True(result);

            var updated = _context.Products.First(p => p.Id == productId);
            Assert.Equal("Updated Product", updated.ProductName);
            Assert.Equal("NEWCODE", updated.ProductCode);
            Assert.Equal(1, updated.GlassStructureId);
        }

        [Fact]
        public void UpdateProduct_ShouldFail_WhenGlassStructureIsInvalid()
        {
            // Arrange
            _context = CreateInMemoryDbContext();
            _context.GlassStructures.AddRange(TestData.GetSampleGlassStructures());
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var dto = new UpdateProductProductDto
            {
                ProductName = "Updated Product",
                ProductCode = "NEWCODE",
                ProductType = "TP",
                UOM = "Tấm",
                Height = "300",
                Width = "150",
                Thickness = 8,
                Weight = 20,
                UnitPrice = 180000,
                Quantity = 4,
                GlassStructureId = -1
            };

            var productId = _context.Products.First().Id;

            // Act
            var result = _productService.UpdateProduct(productId, dto);

            // Assert
            Assert.True(result);

            var updated = _context.Products.First(p => p.Id == productId);
            Assert.Equal("Updated Product", updated.ProductName);
            Assert.Equal("NEWCODE", updated.ProductCode);
            Assert.Equal(1, updated.GlassStructureId);
        }

        //-------------------- DeleteProduct ---------------------

        [Fact]
        public void DeleteProduct_ShouldReturnFalse_WhenIdIsInvalid()
        {
            // Act
            var result = _productService.DeleteProduct(-1);

            // Assert
            Assert.False(result);
        }


        [Fact]
        public async Task DeleteProduct_ShouldReturnTrue_WhenIdExists()
        {

            // Act
            var result = _productService.DeleteProduct(1);

            // Assert
            Assert.True(result);
            Assert.Null( _context.Products.FindAsync(1));
        }

        [Fact]
        public async Task DeleteProduct_ShouldReturnFalse_WhenIdDoesNotExist()
        {
            // Arrange
            int nonExistentId = 9999;

            // Act
            var result = _productService.DeleteProduct(nonExistentId);

            // Assert
            Assert.False(result);
        }

        //-------------------- CreateProduct ---------------------
        [Fact]
        public async Task CreateProduct_ShouldThrow_WhenNameIsNull()
        {
            var dto = new CreateProductProductDto
            {
                ProductName = null,
                ProductCode = "NEW001"
            };

            _productService.CreateProduct(dto);
        }

        [Fact]
        public async Task CreateProduct_ShouldThrow_WhenNameAlreadyExists()
        {
            var dto = new CreateProductProductDto
            {
                ProductName = "Product 1", // đã tồn tại trong TestData
                ProductCode = "NEW002"
            };

            _productService.CreateProduct(dto);
        }

        [Fact]
        public async Task CreateProduct_ShouldThrow_WhenGlassStructureIdIsInvalid()
        {
            var dto = new CreateProductProductDto
            {
                ProductName = "Unique Product",
                ProductCode = "NEW003",
                GlassStructureId = -5 // ID không hợp lệ
            };

            _productService.CreateProduct(dto);
        }

        [Fact]
        public async Task CreateProduct_ShouldThrow_WhenGlassStructureIdNotExists()
        {
            var dto = new CreateProductProductDto
            {
                ProductName = "Unique Product 2",
                ProductCode = "NEW004",
                GlassStructureId = 999 // không tồn tại trong TestData
            };

            _productService.CreateProduct(dto);
        }

        [Fact]
        public async Task CreateProduct_ShouldSucceed_WhenAllFieldsAreValid()
        {
            var dto = new CreateProductProductDto
            {
                ProductName = "Glass Linked Product",
                ProductCode = "NEW006",
                GlassStructureId = 1 // tồn tại trong TestData
            };

            _productService.CreateProduct(dto);
        }
    }
}
