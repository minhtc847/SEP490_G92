using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using SEP490.Modules.Delivery.DTO;
using SEP490.Modules.Delivery.Services;
using TestVNG.Setup;
using SEP490.DB;
using SEP490.DB.Models;
using Xunit;

namespace TestVNG.Serivces
{
    public class DeliveryServiceTests : TestBase
    {
        private readonly DeliveryService _deliveryService;
        private readonly SEP490DbContext _context;

        public DeliveryServiceTests()
        {
            _context = CreateInMemoryDbContext();
            _deliveryService = new DeliveryService(_context);
            
            // Seed test data
            SeedTestData(_context);
        }

        [Fact]
        public async Task GetAllDeliveriesAsync_ShouldReturnAllDeliveries()
        {
            // Act
            var result = await _deliveryService.GetAllDeliveriesAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().BeInDescendingOrder(d => d.CreatedAt);
            
            var firstDelivery = result.Last();
            firstDelivery.OrderCode.Should().Be("SO001");
            firstDelivery.CustomerName.Should().Be("ABC Company");
            firstDelivery.TotalAmount.Should().Be(500000);
            firstDelivery.Status.Should().Be(DeliveryStatus.Delivering);
        }

        [Fact]
        public async Task GetProductionPlanValidationAsync_WithValidSalesOrderId_ShouldReturnValidationItems()
        {
            // Arrange
            var salesOrderId = 1;

            // Act
            var result = await _deliveryService.GetProductionPlanValidationAsync(salesOrderId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            
            var firstItem = result.First();
            firstItem.ProductId.Should().Be(1);
            firstItem.ProductName.Should().Be("Glass Panel A");
            firstItem.AvailableQuantity.Should().Be(2);
            firstItem.RequestedQuantity.Should().Be(0);
        }

        [Fact]
        public async Task GetProductionPlanValidationAsync_WithInvalidSalesOrderId_ShouldReturnEmptyList()
        {
            // Arrange
            var invalidSalesOrderId = 999;

            // Act
            var result = await _deliveryService.GetProductionPlanValidationAsync(invalidSalesOrderId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        [Fact]
        public async Task CreateDeliveryAsync_WithValidData_ShouldReturnDelivery()
        {
            // Arrange
            var createDeliveryDto = new CreateDeliveryDto
            {
                SalesOrderId = 1,
                DeliveryDate = DateTime.Now.AddDays(5),
                ExportDate = DateTime.Now.AddDays(3),
                Status = DeliveryStatus.Delivering,
                Note = "Test delivery",
                DeliveryDetails = new List<CreateDeliveryDetailDto>
                {
                    new CreateDeliveryDetailDto
                    {
                        ProductId = 1,
                        Quantity = 1,
                        Note = "Partial delivery"
                    },
                    new CreateDeliveryDetailDto
                    {
                        ProductId = 2,
                        Quantity = 1,
                        Note = "Full delivery"
                    }
                }
            };

            // Act
            var result = await _deliveryService.CreateDeliveryAsync(createDeliveryDto);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().BeGreaterThan(0);
            result.SalesOrderId.Should().Be(1);
            result.Status.Should().Be(DeliveryStatus.Delivering);
            result.Note.Should().Be("Test delivery");
            
            // Verify delivery was created in database
            var createdDelivery = await _context.Deliveries.FindAsync(result.Id);
            createdDelivery.Should().NotBeNull();
            createdDelivery.SalesOrderId.Should().Be(1);
            
            // Verify delivery details were created
            var deliveryDetails = await _context.DeliveryDetails
                .Where(dd => dd.DeliveryId == result.Id)
                .ToListAsync();
            deliveryDetails.Should().HaveCount(2);
        }

        [Fact]
        public async Task CreateDeliveryAsync_WithInvalidSalesOrderId_ShouldThrowException()
        {
            // Arrange
            var createDeliveryDto = new CreateDeliveryDto
            {
                SalesOrderId = 999, // Invalid sales order ID
                DeliveryDate = DateTime.Now.AddDays(5),
                ExportDate = DateTime.Now.AddDays(3),
                Status = DeliveryStatus.Delivering,
                Note = "Test delivery",
                DeliveryDetails = new List<CreateDeliveryDetailDto>
                {
                    new CreateDeliveryDetailDto
                    {
                        ProductId = 1,
                        Quantity = 1,
                        Note = "Test"
                    }
                }
            };

            // Act & Assert
            var action = async () => await _deliveryService.CreateDeliveryAsync(createDeliveryDto);
            await action.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Không tìm thấy kế hoạch sản xuất cho đơn hàng này*");
        }

        [Fact]
        public async Task UpdateDeliveryStatusAsync_WithValidData_ShouldReturnTrue()
        {
            // Arrange
            var deliveryId = 1;
            var newStatus = 2; // Completed

            // Act
            var result = await _deliveryService.UpdateDeliveryStatusAsync(deliveryId, newStatus);

            // Assert
            result.Should().BeTrue();
            
            // Verify delivery status was updated
            var updatedDelivery = await _context.Deliveries.FindAsync(deliveryId);
            updatedDelivery.Should().NotBeNull();
            updatedDelivery.Status.Should().Be(DeliveryStatus.FullyDelivered);
            
            // Verify DaGiao was updated in ProductionPlanDetail when status is Completed
            var productionPlanDetails = await _context.ProductionPlanDetails
                .Where(ppd => ppd.ProductionPlan.SaleOrderId == updatedDelivery.SalesOrderId)
                .ToListAsync();
            
            var deliveryDetails = await _context.DeliveryDetails
                .Where(dd => dd.DeliveryId == deliveryId)
                .ToListAsync();
            
            foreach (var deliveryDetail in deliveryDetails)
            {
                var planDetail = productionPlanDetails.FirstOrDefault(ppd => ppd.ProductId == deliveryDetail.ProductId);
                if (planDetail != null)
                {
                    planDetail.DaGiao.Should().Be(deliveryDetail.Quantity);
                }
            }
        }

        [Fact]
        public async Task UpdateDeliveryStatusAsync_WithInvalidDeliveryId_ShouldThrowException()
        {
            // Arrange
            var invalidDeliveryId = 999;
            var newStatus = 2;

            // Act & Assert
            var action = async () => await _deliveryService.UpdateDeliveryStatusAsync(invalidDeliveryId, newStatus);
            await action.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Không tìm thấy phiếu giao hàng*");
        }

        [Fact]
        public async Task GetDeliveryDetailAsync_WithValidDeliveryId_ShouldReturnDeliveryDetail()
        {
            // Arrange
            var deliveryId = 1;

            // Act
            var result = await _deliveryService.GetDeliveryDetailAsync(deliveryId);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(deliveryId);
            result.SalesOrderId.Should().Be(1);
            result.OrderCode.Should().Be("SO001");
            result.CustomerName.Should().Be("ABC Company");
            result.CustomerAddress.Should().Be("123 Main St");
            result.CustomerPhone.Should().Be("0123456789");
            result.DeliveryDetails.Should().HaveCount(2);
            
            var firstDetail = result.DeliveryDetails.First();
            firstDetail.ProductId.Should().Be(1);
            firstDetail.ProductName.Should().Be("Glass Panel A");
            firstDetail.Quantity.Should().Be(1);
        }

        [Fact]
        public async Task GetDeliveryDetailAsync_WithInvalidDeliveryId_ShouldThrowException()
        {
            // Arrange
            var invalidDeliveryId = 999;

            // Act & Assert
            var action = async () => await _deliveryService.GetDeliveryDetailAsync(invalidDeliveryId);
            await action.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Không tìm thấy phiếu giao hàng*");
        }

        [Fact]
        public async Task UpdateDeliveryAsync_WithValidData_ShouldReturnTrue()
        {
            // Arrange
            var deliveryId = 1;
            var updateDeliveryDto = new UpdateDeliveryDto
            {
                DeliveryDate = DateTime.Now.AddDays(10),
                ExportDate = DateTime.Now.AddDays(8),
                Status = DeliveryStatus.FullyDelivered,
                Note = "Updated delivery",
                DeliveryDetails = new List<UpdateDeliveryDetailDto>
                {
                    new UpdateDeliveryDetailDto
                    {
                        Id = 1,
                        ProductId = 1,
                        Quantity = 2,
                        Note = "Updated quantity"
                    }
                }
            };

            // Act
            var result = await _deliveryService.UpdateDeliveryAsync(deliveryId, updateDeliveryDto);

            // Assert
            result.Should().BeTrue();
            
            // Verify delivery was updated
            var updatedDelivery = await _context.Deliveries.FindAsync(deliveryId);
            updatedDelivery.Should().NotBeNull();
            updatedDelivery.Status.Should().Be(DeliveryStatus.FullyDelivered);
            updatedDelivery.Note.Should().Be("Updated delivery");
            
            // Verify delivery detail was updated
            var updatedDetail = await _context.DeliveryDetails
                .FirstOrDefaultAsync(dd => dd.DeliveryDetailId == 1);
            updatedDetail.Should().NotBeNull();
            updatedDetail.Quantity.Should().Be(2);
            updatedDetail.Note.Should().Be("Updated quantity");
        }

        [Fact]
        public async Task UpdateDeliveryAsync_WithInvalidDeliveryId_ShouldThrowException()
        {
            // Arrange
            var invalidDeliveryId = 999;
            var updateDeliveryDto = new UpdateDeliveryDto
            {
                DeliveryDate = DateTime.Now.AddDays(10),
                ExportDate = DateTime.Now.AddDays(8),
                Status = DeliveryStatus.FullyDelivered,
                Note = "Updated delivery",
                DeliveryDetails = new List<UpdateDeliveryDetailDto>()
            };

            // Act & Assert
            var action = async () => await _deliveryService.UpdateDeliveryAsync(invalidDeliveryId, updateDeliveryDto);
            await action.Should().ThrowAsync<InvalidOperationException>()
                .WithMessage("*Không tìm thấy phiếu giao hàng*");
        }

        [Fact]
        public async Task CreateDeliveryAsync_WithEmptyDeliveryDetails_ShouldStillCreateDelivery()
        {
            // Arrange
            var createDeliveryDto = new CreateDeliveryDto
            {
                SalesOrderId = 1,
                DeliveryDate = DateTime.Now.AddDays(5),
                ExportDate = DateTime.Now.AddDays(3),
                Status = DeliveryStatus.Delivering,
                Note = "Test delivery with no details",
                DeliveryDetails = new List<CreateDeliveryDetailDto>() // Empty list
            };

            // Act
            var result = await _deliveryService.CreateDeliveryAsync(createDeliveryDto);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().BeGreaterThan(0);
            result.SalesOrderId.Should().Be(1);
            
            // Verify delivery was created but with no details
            var deliveryDetails = await _context.DeliveryDetails
                .Where(dd => dd.DeliveryId == result.Id)
                .ToListAsync();
            deliveryDetails.Should().BeEmpty();
        }

        [Fact]
        public async Task UpdateDeliveryStatusAsync_WithNonCompletedStatus_ShouldNotUpdateDaGiao()
        {
            // Arrange
            var deliveryId = 1;
            var newStatus = 1; // Delivering (not completed)

            // Act
            var result = await _deliveryService.UpdateDeliveryStatusAsync(deliveryId, newStatus);

            // Assert
            result.Should().BeTrue();
            
            // Verify delivery status was updated
            var updatedDelivery = await _context.Deliveries.FindAsync(deliveryId);
            updatedDelivery.Should().NotBeNull();
            updatedDelivery.Status.Should().Be(DeliveryStatus.Delivering);
            
            // Verify DaGiao was NOT updated (should remain 0)
            var productionPlanDetails = await _context.ProductionPlanDetails
                .Where(ppd => ppd.ProductionPlan.SaleOrderId == updatedDelivery.SalesOrderId)
                .ToListAsync();
            
            foreach (var planDetail in productionPlanDetails)
            {
                planDetail.DaGiao.Should().Be(0); // Should not be updated for non-completed status
            }
        }

        [Fact]
        public async Task GetDeliveryDetailAsync_ShouldCalculateCorrectTotalAmount()
        {
            // Arrange
            var deliveryId = 1;

            // Act
            var result = await _deliveryService.GetDeliveryDetailAsync(deliveryId);

            // Assert
            result.Should().NotBeNull();
            result.TotalAmount.Should().BeGreaterThan(0);
            
            // Verify total amount is calculated from delivery details
            var expectedTotal = result.DeliveryDetails.Sum(d => d.Amount);
            result.TotalAmount.Should().Be(expectedTotal);
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
} 