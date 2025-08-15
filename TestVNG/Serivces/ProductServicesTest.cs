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

            SeedTestData(_context);
        }


        //-------------------- GetAllProducts ---------------------

        [Fact]
        public void GetAllProducts_ShouldReturnEmptyList_WhenNoProductsExist()
        {
            _context = CreateInMemoryDbContext();
            _productService = new ProductService(_context);

            var result = _productService.GetAllProducts();

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public void GetAllProducts_ShouldReturnProducts_WithoutGlassStructure()
        {
            _context = CreateInMemoryDbContext();
            _context.Products.Add(TestData.GetSampleProducts().First(p => p.GlassStructureId == null));
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var result = _productService.GetAllProducts();

            Assert.Single(result);
            var product = result.First();
            Assert.Equal("PROD001", product.ProductCode);
            Assert.Null(product.GlassStructureProductName);
        }

        [Fact]
        public void GetAllProducts_ShouldReturnProducts_WithGlassStructure()
        {
            _context = CreateInMemoryDbContext();
            var glassStructures = TestData.GetSampleGlassStructures();
            var products = TestData.GetSampleProducts();

            _context.GlassStructures.AddRange(glassStructures);
            _context.Products.Add(products.First(p => p.GlassStructureId == 1));
            _context.SaveChanges();

            _productService = new ProductService(_context);

            var result = _productService.GetAllProducts();

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
            _context = CreateInMemoryDbContext();
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var result = _productService.GetProductById(999);

            Assert.Null(result);
        }

        [Fact]
        public void GetProductById_ShouldReturnProduct_WhenIdExists()
        {
            _context = CreateInMemoryDbContext();

            var glassStructure = TestData.GetSampleGlassStructures().First();
            _context.GlassStructures.Add(glassStructure);
            _context.SaveChanges();

            var product = TestData.GetSampleProducts().First(p => p.GlassStructureId == 1);
            _context.Products.Add(product);
            _context.SaveChanges();

            var insertedProduct = _context.Products.First(p => p.ProductCode == "PROD002");

            _productService = new ProductService(_context);

            var result = _productService.GetProductById(insertedProduct.Id);

            Assert.NotNull(result);
            Assert.Equal("PROD002", result.ProductCode);
            Assert.NotNull(result.GlassStructure);
            Assert.Equal("Glass A", result.GlassStructure.ProductName);
        }

        [Fact]
        public void GetProductById_ShouldReturnNull_WhenIdIsNegative()
        {
            _context = CreateInMemoryDbContext();
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var result = _productService.GetProductById(-1); 

            Assert.Null(result);
        }

        //-------------------- UpdateProduct ---------------------

        [Fact]
        public void UpdateProduct_ShouldReturnFalse_WhenIdDoesNotExist()
        {
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

            var result = _productService.UpdateProduct(999, dto);

            Assert.False(result);
        }

        [Fact]
        public void UpdateProduct_ShouldReturnFalse_WhenIdIsInvalid()
        {
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

            var result = _productService.UpdateProduct(-1, dto);

            Assert.False(result);
        }

        [Fact]
        public void UpdateProduct_ShouldReturnTrue_WhenIdExists_AndValidData()
        {
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

            var result = _productService.UpdateProduct(productId, dto);

            Assert.True(result);

            var updated = _context.Products.First(p => p.Id == productId);
            Assert.Equal("Updated Product", updated.ProductName);
            Assert.Equal("NEWCODE", updated.ProductCode);
            Assert.Equal(1, updated.GlassStructureId);
        }

        [Fact]
        public void UpdateProduct_ShouldThrow_WhenProductNameIsNull()
        {
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

            var ex = Assert.Throws<ArgumentException>(() => _productService.UpdateProduct(productId, dto));
            Assert.Equal("ProductName is required", ex.Message);
        }


        [Fact]
        public void UpdateProduct_ShouldRemoveGlassStructure_WhenGlassStructureIdIsNull()
        {
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
                GlassStructureId = null
            };

            var result = _productService.UpdateProduct(productWithGlass.Id, dto);

            Assert.True(result);
            var updated = _context.Products.First(p => p.Id == productWithGlass.Id);
            Assert.Null(updated.GlassStructureId);
        }

        [Fact]
        public void UpdateProduct_ShouldSetGlassStructure_WhenValidGlassStructureId()
        {
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

            var result = _productService.UpdateProduct(product.Id, dto);

            Assert.True(result);
            var updated = _context.Products.First(p => p.Id == product.Id);
            Assert.Equal(1, updated.GlassStructureId);
        }

        [Fact]
        public void UpdateProduct_ShouldThrow_WhenGlassStructureIdIsInvalid()
        {
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

            var ex = Assert.Throws<ArgumentException>(() => _productService.UpdateProduct(product.Id, dto));
            Assert.Equal("Invalid GlassStructureId", ex.Message);
        }

        [Fact]
        public void UpdateProduct_ShouldThrow_WhenProductNameIsDuplicated()
        {
            _context = CreateInMemoryDbContext();
            _context.GlassStructures.AddRange(TestData.GetSampleGlassStructures());
            _context.Products.AddRange(TestData.GetSampleProducts());
            _context.SaveChanges();
            _productService = new ProductService(_context);

            var existingProductName = _context.Products.Skip(1).First().ProductName;
            var productId = _context.Products.First().Id;

            var dto = new UpdateProductProductDto
            {
                ProductName = existingProductName,
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

            var ex = Assert.Throws<ArgumentException>(() => _productService.UpdateProduct(productId, dto));
            Assert.Equal("Duplicate ProductName", ex.Message);
        }


        [Fact]
        public void UpdateProduct_ShouldThrow_WhenGlassStructureIsInvalid()
        {
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

            var ex = Assert.Throws<ArgumentException>(() => _productService.UpdateProduct(productId, dto));
            Assert.Equal("Invalid GlassStructureId", ex.Message);
        }


        //-------------------- DeleteProduct ---------------------

        [Fact]
        public void DeleteProduct_ShouldReturnFalse_WhenIdIsInvalid()
        {
            var result = _productService.DeleteProduct(-1);

            Assert.False(result);
        }

        [Fact]
        public void DeleteProduct_ShouldReturnTrue_WhenIdExists_AndNotUsedInOrder()
        {
            using var context = CreateInMemoryDbContext();
            context.Products.Add(new Product
            {
                Id = 1,
                ProductCode = "PROD001",
                ProductName = "Test Product"
            });
            context.SaveChanges();

            var service = new ProductService(context);

            var result = service.DeleteProduct(1);

            Assert.True(result);
            Assert.Empty(context.Products);
        }

        [Fact]
        public void DeleteProduct_ShouldThrow_WhenProductUsedInOrder()
        {
            using var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new ProductService(context);

            var ex = Assert.Throws<InvalidOperationException>(() => service.DeleteProduct(1));

            Assert.Equal("Sản phẩm đang được sử dụng trong đơn hàng, không thể xoá!", ex.Message);
        }


        [Fact]
        public async Task DeleteProduct_ShouldReturnFalse_WhenIdDoesNotExist()
        {
            int nonExistentId = 9999;

            var result = _productService.DeleteProduct(nonExistentId);

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
                ProductName = "Product 1",
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
                GlassStructureId = -5
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
                GlassStructureId = 999 
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
                GlassStructureId = 1 
            };

            _productService.CreateProduct(dto);
        }
    }
}
