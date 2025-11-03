using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Moq;
using SEP490.Modules.InvoiceModule.DTO;
using SEP490.Modules.InvoiceModule.Service;
using SEP490.Modules.PaymentsModule.DTO;
using SEP490.Modules.PaymentsModule.Service;
using TestVNG.Setup;
using SEP490.DB;
using SEP490.DB.Models;
using Xunit;

namespace TestVNG.Serivces
{
    public class InvoiceServiceTests : TestBase
    {
        private readonly InvoiceService _invoiceService;
        private readonly SEP490DbContext _context;
        private readonly Mock<IPaymentService> _mockPaymentService;

        public InvoiceServiceTests()
        {
            _context = CreateInMemoryDbContext();
            _mockPaymentService = new Mock<IPaymentService>();
            _invoiceService = new InvoiceService(_context, _mockPaymentService.Object);
            
            // Seed test data
            SeedTestData(_context);
        }

        [Fact]
        public void GetAllInvoices_ShouldReturnAllInvoices()
        {
            // Act
            var result = _invoiceService.GetAllInvoices();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.Should().BeInDescendingOrder(i => i.InvoiceDate);
            
            var firstInvoice = result.First();
            firstInvoice.CustomerName.Should().Be("XYZ Corporation");
            firstInvoice.TotalAmount.Should().Be(330000);

            var secondInvoice = result.Last();
            secondInvoice.CustomerName.Should().Be("ABC Company");
        }

        [Fact]
        public void GetInvoiceById_WithValidId_ShouldReturnInvoiceWithDetails()
        {
            // Arrange
            var invoiceId = 1;

            // Act
            var result = _invoiceService.GetInvoiceById(invoiceId);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(invoiceId);
            result.CustomerName.Should().Be("ABC Company");
            result.InvoiceCode.Should().Be("INV000001");
            result.InvoiceDetails.Should().HaveCount(2);
            
            var firstDetail = result.InvoiceDetails.First();
            firstDetail.ProductName.Should().Be("Glass Panel A");
            firstDetail.Quantity.Should().Be(2);
            firstDetail.UnitPrice.Should().Be(100000);
        }

        [Fact]
        public void GetInvoiceById_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            var invalidInvoiceId = 999;

            // Act
            var result = _invoiceService.GetInvoiceById(invalidInvoiceId);

            // Assert
            result.Should().BeNull();
        }

        [Fact]
        public void GetInvoiceWithPayments_WithValidId_ShouldReturnInvoiceWithPayments()
        {
            // Arrange
            var invoiceId = 1;
            var mockPayments = new List<PaymentDto>
            {
                new PaymentDto { Id = 1, InvoiceId = invoiceId, Amount = 200000, PaymentDate = DateTime.Now }
            };

            _mockPaymentService.Setup(x => x.GetPaymentsByInvoiceId(invoiceId)).Returns(mockPayments);
            _mockPaymentService.Setup(x => x.GetTotalPaidAmount(invoiceId)).Returns(200000);

            // Act
            var result = _invoiceService.GetInvoiceWithPayments(invoiceId);

            // Assert
            result.Should().NotBeNull();
            result.Id.Should().Be(invoiceId);
            result.CustomerName.Should().Be("ABC Company");
            result.TotalAmount.Should().Be(550000);
            result.TotalPaidAmount.Should().Be(200000);
            result.RemainingAmount.Should().Be(350000);
            result.Payments.Should().HaveCount(1);
        }

        [Fact]
        public void GetInvoiceWithPayments_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            var invalidInvoiceId = 999;

            // Act
            var result = _invoiceService.GetInvoiceWithPayments(invalidInvoiceId);

            // Assert
            result.Should().BeNull();
        }

        //[Fact]
        //public void CreateInvoice_WithValidData_ShouldReturnInvoiceId()
        //{
        //    // Arrange
        //    var createInvoiceDto = new CreateInvoiceDto
        //    {
        //        CustomerId = 1,
        //        InvoiceType = InvoiceType.Sales,
        //        InvoiceDate = DateTime.Now,
        //        DueDate = DateTime.Now.AddDays(30),
        //        Subtotal = 400000,
        //        Tax = 40000,
        //        TotalAmount = 440000,
        //        Status = InvoiceStatus.Unpaid,
        //        InvoiceDetails = new List<CreateInvoiceDetailDto>
        //        {
        //            new CreateInvoiceDetailDto
        //            {
        //                ProductId = 1,
        //                Quantity = 2,
        //                UnitPrice = 100000,
        //                Total = 200000
        //            },
        //            new CreateInvoiceDetailDto
        //            {
        //                ProductId = 2,
        //                Quantity = 1,
        //                UnitPrice = 150000,
        //                Total = 150000
        //            }
        //        }
        //    };

        //    // Act
        //    var result = _invoiceService.CreateInvoice(createInvoiceDto);

        //    // Assert
        //    result.Should().BeGreaterThan(0);
            
        //    // Verify invoice was created in database
        //    var createdInvoice = _context.Invoices.Find(result);
        //    createdInvoice.Should().NotBeNull();
        //    createdInvoice.CustomerId.Should().Be(1);
        //    createdInvoice.TotalAmount.Should().Be(440000);
            
        //    // Verify invoice details were created
        //    var invoiceDetails = _context.InvoiceDetails.Where(id => id.InvoiceId == result).ToList();
        //    invoiceDetails.Should().HaveCount(2);
        //}

        [Fact]
        public void CreateInvoice_WithInvalidCustomerId_ShouldThrowArgumentException()
        {
            // Arrange
            var createInvoiceDto = new CreateInvoiceDto
            {
                CustomerId = 999, // Invalid customer ID
                InvoiceType = InvoiceType.Sales,
                InvoiceDate = DateTime.Now,
                DueDate = DateTime.Now.AddDays(30),
                Subtotal = 400000,
                Tax = 40000,
                TotalAmount = 440000,
                Status = InvoiceStatus.Unpaid,
                InvoiceDetails = new List<CreateInvoiceDetailDto>
                {
                    new CreateInvoiceDetailDto
                    {
                        ProductId = 1,
                        Quantity = 2,
                        UnitPrice = 100000,
                        Total = 200000
                    }
                }
            };

            // Act & Assert
            var action = () => _invoiceService.CreateInvoice(createInvoiceDto);
            action.Should().Throw<ArgumentException>().WithMessage("*Customer with ID 999 not found*");
        }

        [Fact]
        public void CreateInvoice_WithInvalidProductId_ShouldThrowArgumentException()
        {
            // Arrange
            var createInvoiceDto = new CreateInvoiceDto
            {
                CustomerId = 1,
                InvoiceType = InvoiceType.Sales,
                InvoiceDate = DateTime.Now,
                DueDate = DateTime.Now.AddDays(30),
                Subtotal = 400000,
                Tax = 40000,
                TotalAmount = 440000,
                Status = InvoiceStatus.Unpaid,
                InvoiceDetails = new List<CreateInvoiceDetailDto>
                {
                    new CreateInvoiceDetailDto
                    {
                        ProductId = 999, // Invalid product ID
                        Quantity = 2,
                        UnitPrice = 100000,
                        Total = 200000
                    }
                }
            };

            // Act & Assert
            var action = () => _invoiceService.CreateInvoice(createInvoiceDto);
            action.Should().Throw<System.InvalidOperationException>();
        }

        [Fact]
        public void CreateInvoice_WithEmptyInvoiceDetails_ShouldThrowArgumentException()
        {
            // Arrange
            var createInvoiceDto = new CreateInvoiceDto
            {
                CustomerId = 1,
                InvoiceType = InvoiceType.Sales,
                InvoiceDate = DateTime.Now,
                DueDate = DateTime.Now.AddDays(30),
                Subtotal = 400000,
                Tax = 40000,
                TotalAmount = 440000,
                Status = InvoiceStatus.Unpaid,
                InvoiceDetails = new List<CreateInvoiceDetailDto>() // Empty list
            };

            // Act & Assert
            var action = () => _invoiceService.CreateInvoice(createInvoiceDto);
            action.Should().Throw<ArgumentException>().WithMessage("*Invoice must have at least one detail*");
        }

        [Fact]
        public void CreateInvoice_WithInvalidCustomerIdZero_ShouldThrowArgumentException()
        {
            // Arrange
            var createInvoiceDto = new CreateInvoiceDto
            {
                CustomerId = 0, // Invalid customer ID
                InvoiceType = InvoiceType.Sales,
                InvoiceDate = DateTime.Now,
                DueDate = DateTime.Now.AddDays(30),
                Subtotal = 400000,
                Tax = 40000,
                TotalAmount = 440000,
                Status = InvoiceStatus.Unpaid,
                InvoiceDetails = new List<CreateInvoiceDetailDto>
                {
                    new CreateInvoiceDetailDto
                    {
                        ProductId = 1,
                        Quantity = 2,
                        UnitPrice = 100000,
                        Total = 200000
                    }
                }
            };

            // Act & Assert
            var action = () => _invoiceService.CreateInvoice(createInvoiceDto);
            action.Should().Throw<ArgumentException>().WithMessage("*CustomerId must be greater than 0*");
        }

        [Fact]
        public void UpdateInvoice_WithValidData_ShouldReturnTrue()
        {
            // Arrange
            var invoiceId = 1;
            var updateInvoiceDto = new CreateInvoiceDto
            {
                CustomerId = 2,
                InvoiceType = InvoiceType.Sales,
                InvoiceDate = DateTime.Now,
                DueDate = DateTime.Now.AddDays(45),
                Subtotal = 600000,
                Tax = 60000,
                TotalAmount = 660000,
                Status = InvoiceStatus.PartiallyPaid,
                InvoiceDetails = new List<CreateInvoiceDetailDto>
                {
                    new CreateInvoiceDetailDto
                    {
                        ProductId = 3,
                        Quantity = 4,
                        UnitPrice = 50000,
                        Total = 200000
                    }
                }
            };

            // Act
            var result = _invoiceService.UpdateInvoice(invoiceId, updateInvoiceDto);

            // Assert
            result.Should().BeTrue();
            
            // Verify invoice was updated
            var updatedInvoice = _context.Invoices.Find(invoiceId);
            updatedInvoice.Should().NotBeNull();
            updatedInvoice.CustomerId.Should().Be(2);
            updatedInvoice.TotalAmount.Should().Be(660000);
            updatedInvoice.Status.Should().Be(InvoiceStatus.PartiallyPaid);
            
            // Verify old details were removed and new ones added
            var invoiceDetails = _context.InvoiceDetails.Where(id => id.InvoiceId == invoiceId).ToList();
            invoiceDetails.Should().HaveCount(1);
            invoiceDetails.First().ProductId.Should().Be(3);
        }

        [Fact]
        public void UpdateInvoice_WithInvalidId_ShouldReturnFalse()
        {
            // Arrange
            var invalidInvoiceId = 999;
            var updateInvoiceDto = new CreateInvoiceDto
            {
                CustomerId = 1,
                InvoiceType = InvoiceType.Sales,
                InvoiceDate = DateTime.Now,
                DueDate = DateTime.Now.AddDays(30),
                Subtotal = 400000,
                Tax = 40000,
                TotalAmount = 440000,
                Status = InvoiceStatus.Unpaid,
                InvoiceDetails = new List<CreateInvoiceDetailDto>
                {
                    new CreateInvoiceDetailDto
                    {
                        ProductId = 1,
                        Quantity = 2,
                        UnitPrice = 100000,
                        Total = 200000
                    }
                }
            };

            // Act
            var result = _invoiceService.UpdateInvoice(invalidInvoiceId, updateInvoiceDto);

            // Assert
            result.Should().BeFalse();
        }

        [Fact]
        public void DeleteInvoice_WithValidId_ShouldReturnTrue()
        {
            // Arrange
            var invoiceId = 1;

            // Act
            var result = _invoiceService.DeleteInvoice(invoiceId);

            // Assert
            result.Should().BeTrue();
            
            // Verify invoice was deleted
            var deletedInvoice = _context.Invoices.Find(invoiceId);
            deletedInvoice.Should().BeNull();
            
            // Verify invoice details were also deleted
            var invoiceDetails = _context.InvoiceDetails.Where(id => id.InvoiceId == invoiceId).ToList();
            invoiceDetails.Should().BeEmpty();
        }

        [Fact]
        public void DeleteInvoice_WithInvalidId_ShouldReturnFalse()
        {
            // Arrange
            var invalidInvoiceId = 999;

            // Act
            var result = _invoiceService.DeleteInvoice(invalidInvoiceId);

            // Assert
            result.Should().BeFalse();
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }
} 