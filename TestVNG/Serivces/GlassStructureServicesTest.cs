using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.Modules.GlassStructureModule.DTO;
using SEP490.Modules.GlassStructureModule.Service;
using System.Linq;
using TestVNG.Setup;
using Xunit;

namespace TestVNG.Serivces
{
    public class GlassStructureServicesTest : TestBase
    {
        private GlassStructureService _glassStructureService;
        private SEP490DbContext _context;

        public GlassStructureServicesTest()
        {
            _context = CreateInMemoryDbContext();
            _glassStructureService = new GlassStructureService(_context);

            SeedTestData(_context);
        }

        //-------------------- GetAllProducts ---------------------

        [Fact]
        public async Task GetAllGlassStructures_ShouldReturnEmptyList_WhenNoData()
        {
            var context = CreateInMemoryDbContext();
            var service = new GlassStructureService(context);

            var result = service.GetAllGlassStructures();

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public async Task GetAllGlassStructures_ShouldReturnList_WhenDataExists()
        {
            var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var result = service.GetAllGlassStructures();

            Assert.NotNull(result);
            Assert.Equal(2, result.Count);
        }



        //-------------------- GetGlassStructureById ---------------------

        [Fact]
        public async Task GetGlassStructureById_Should_ReturnGlassStructure_When_Id_Exists()
        {
            var result = _glassStructureService.GetGlassStructureById(1);

            Assert.NotNull(result);
            Assert.Equal("Glass A", result.ProductName);
            Assert.Equal("GLA001", result.ProductCode);
        }

        [Fact]
        public async Task GetGlassStructureById_Should_ThrowException_When_Id_Does_Not_Exist()
        {
            var ex = await Assert.ThrowsAsync<ArgumentException>(async () =>
                 _glassStructureService.GetGlassStructureById(999)
            );

            Assert.Equal("GlassStructure not found", ex.Message);
        }


        [Fact]
        public async Task GetGlassStructureById_Should_ThrowException_When_Id_Is_Invalid()
        {

            var ex = await Assert.ThrowsAsync<ArgumentException>(async () =>
                 _glassStructureService.GetGlassStructureById(-5)
            );
            Assert.Equal("Invalid GlassStructure ID", ex.Message);
        }

        //-------------------- AddGlassStructure ---------------------

        [Fact]
        public async Task AddGlassStructure_NameIsNull_ThrowsArgumentException()
        {
            var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = null,
                ProductCode = "GL001",
                Category = "Double",
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = 100000,
                Composition = "A+B"
            };

            _glassStructureService.AddGlassStructure(dto);
        }

        [Fact]
        public async Task AddGlassStructure_NameAlreadyExists_ThrowsArgumentException()
        {
            var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = "Glass A", 
                ProductCode = "GL002",
                Category = "Double",
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = 100000,
                Composition = "A+B"
            };

            _glassStructureService.AddGlassStructure(dto);
        }

        [Fact]
        public async Task AddGlassStructure_CodeIsNull_ThrowsArgumentException()
        {
            var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = "Glass B",
                ProductCode = null,
                Category = "Double",
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = 100000,
                Composition = "A+B"
            };

            _glassStructureService.AddGlassStructure(dto);
        }

        [Fact]
        public async Task AddGlassStructure_CategoryIsNull_ThrowsArgumentException()
        {
            var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = "Glass C",
                ProductCode = "GL003",
                Category = null,
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = 100000,
                Composition = "A+B"
            };

            service.AddGlassStructure(dto);
        }

        [Fact]
        public async Task AddGlassStructure_UnitPriceIsZero_ThrowsArgumentException()
        {
            var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = "Glass D",
                ProductCode = "GL004",
                Category = "Triple",
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 3,
                AdhesiveLayers = 2,
                AdhesiveThickness = 1,
                UnitPrice = 0,
                Composition = "X+Y"
            };

            service.AddGlassStructure(dto);
        }

        [Fact]
        public async Task AddGlassStructure_ValidInput_SuccessfullyCreates()
        {
            var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = "Glass New",
                ProductCode = "GL005",
                Category = "Triple",
                EdgeType = "Rough",
                AdhesiveType = "Silicon",
                GlassLayers = 3,
                AdhesiveLayers = 2,
                AdhesiveThickness = 0.8m,
                UnitPrice = 250000,
                Composition = "X+Y"
            };

            service.AddGlassStructure(dto);
        }

        [Fact]
        public async Task AddGlassStructure_Should_ThrowException_When_UnitPriceIsNegative()
        {
            var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = "Glass X",
                ProductCode = "GLX999",
                Category = "Double",
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = -1000, 
                Composition = "X+Y"
            };

            service.AddGlassStructure(dto);
        }

        [Fact]
        public async Task AddGlassStructure_Should_ThrowException_When_CategoryIsNull()
        {
            var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = "Glass Null Category",
                ProductCode = "GLN001",
                Category = null,
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = 200000,
                Composition = "A+B"
            };

            service.AddGlassStructure(dto);
        }

        //-------------------- DeleteGlassStructureById ---------------------

        [Fact]
        public async Task DeleteGlassStructureById_ShouldDelete_WhenIdExists()
        {
            var existingId = 2;

            _glassStructureService.DeleteGlassStructureById(existingId);
        }

        [Fact]
        public async Task DeleteGlassStructureById_ShouldThrow_WhenIdDoesNotExist()
        {
            var nonExistingId = 999;

            _glassStructureService.DeleteGlassStructureById(nonExistingId);
        }

        [Fact]
        public async Task DeleteGlassStructureById_ShouldThrow_WhenIdIsInvalid()
        {
            var invalidId = 0;

            _glassStructureService.DeleteGlassStructureById(invalidId);
        }


        //-------------------- UpdateGlassStructureById ---------------------

        [Fact]
        public async Task UpdateGlassStructureById_ShouldUpdate_WhenValidInput()
        {
            using var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var updateDto = new UpdateGlassStructureDto
            {
                ProductName = "Updated Name",
                ProductCode = "GLA002",
                Category = "Triple",
                EdgeType = "Rough",
                AdhesiveType = "PU",
                GlassLayers = 3,
                AdhesiveLayers = 2,
                AdhesiveThickness = 1.0m,
                UnitPrice = 300000,
                Composition = "A+C"
            };

            service.UpdateGlassStructureById(1, updateDto);
        }

        [Fact]
        public async Task UpdateGlassStructureById_ShouldThrow_WhenIdNotExist()
        {
            using var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var updateDto = new UpdateGlassStructureDto
            {
                ProductName = "New Name",
                ProductCode = "GLX001",
                Category = "Double",
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = 200000,
                Composition = "A+B"
            };

            service.UpdateGlassStructureById(999, updateDto);
        }

        [Fact]
        public async Task UpdateGlassStructureById_ShouldThrow_WhenIdIsInvalid()
        {
            using var context = CreateInMemoryDbContext();
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = "Test",
                ProductCode = "TEST",
                Category = "Double",
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = 200000,
                Composition = "A+B"
            };

            service.UpdateGlassStructureById(0, dto);
        }

        [Fact]
        public async Task UpdateGlassStructureById_ShouldThrow_WhenCategoryIsNull()
        {
            using var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = "Test",
                ProductCode = "CODE",
                Category = null,
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = 200000,
                Composition = "A+B"
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() => service.UpdateGlassStructureById(1, dto));
            Assert.Equal("Category is required", ex.Message);
        }


        [Fact]
        public async Task UpdateGlassStructureById_ShouldThrow_WhenProductCodeIsNull()
        {
            using var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = "Test",
                ProductCode = null, 
                Category = "Double",
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = 200000,
                Composition = "A+B"
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() => service.UpdateGlassStructureById(1, dto));
            Assert.Equal("ProductCode is required", ex.Message);
        }

        [Fact]
        public async Task UpdateGlassStructureById_ShouldThrow_WhenProductNameIsNull()
        {
            using var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = null, 
                ProductCode = "NEW001",
                Category = "Double",
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = 200000,
                Composition = "A+B"
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() => service.UpdateGlassStructureById(1, dto));
            Assert.Equal("ProductName is required", ex.Message);
        }

        [Fact]
        public async Task UpdateGlassStructureById_ShouldThrow_WhenProductNameIsDuplicated()
        {
            using var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            context.GlassStructures.Add(new SEP490.DB.Models.GlassStructure
            {
                Id = 99,
                ProductName = "Duplicated Name",
                ProductCode = "DUP001",
                Category = "Single",
                EdgeType = "Rough",
                AdhesiveType = "PU",
                GlassLayers = 1,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.2m,
                UnitPrice = 100000,
                Composition = "X+Y"
            });
            context.SaveChanges();

            var dto = new UpdateGlassStructureDto
            {
                ProductName = "Duplicated Name",
                ProductCode = "NEW999",
                Category = "Double",
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = 200000,
                Composition = "A+B"
            };

            var ex = await Assert.ThrowsAsync<ArgumentException>(() => service.UpdateGlassStructureById(1, dto));
            Assert.Equal("Duplicate ProductName", ex.Message);
        }

        [Fact]
        public async Task UpdateGlassStructureById_ShouldThrow_WhenUnitPriceIsNullOrNegative()
        {
            using var context = CreateInMemoryDbContext();
            SeedTestData(context);
            var service = new GlassStructureService(context);

            var dto = new UpdateGlassStructureDto
            {
                ProductName = "Test Price",
                ProductCode = "PRICE01",
                Category = "Double",
                EdgeType = "Polished",
                AdhesiveType = "UV",
                GlassLayers = 2,
                AdhesiveLayers = 1,
                AdhesiveThickness = 0.5m,
                UnitPrice = -1000, 
                Composition = "A+B"
            };

            service.UpdateGlassStructureById(1, dto);
        }
    }
}
