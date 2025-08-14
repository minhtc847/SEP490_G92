using Moq;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Debts.DTO;
using SEP490.Modules.Debts.Service;
using SEP490.Modules.PaymentsModule.Service;
using System.Linq;
using TestVNG.Setup;
using Xunit;

namespace TestVNG.Services
{
    public class DebtServiceTest : TestBase
    {
        private readonly SEP490DbContext _context;
        private readonly DebtService _debtService;
        private readonly Mock<IPaymentService> _paymentServiceMock;

        public DebtServiceTest()
        {
            _context = CreateInMemoryDbContext();
            _paymentServiceMock = new Mock<IPaymentService>();
            _paymentServiceMock.Setup(x => x.GetTotalPaidAmount(It.IsAny<int>()))
                               .Returns(0); // mặc định chưa trả

            _debtService = new DebtService(_context, _paymentServiceMock.Object);
        }

        //-------------------- GetAllDebts ---------------------

        [Fact]
        public void GetAllDebts_NoCustomers_ReturnsEmptyList()
        {
            var result = _debtService.GetAllDebts();

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public void GetAllDebts_CustomersWithoutInvoices_ReturnsEmptyList()
        {
            _context.Customers.AddRange(TestData.GetSampleCustomers());
            _context.SaveChanges();

            var result = _debtService.GetAllDebts();

            Assert.Empty(result);
        }

        [Fact]
        public void GetAllDebts_CustomersWithPaidInvoices_ReturnsEmptyList()
        {
            var customer = new Customer { Id = 10, CustomerName = "Paid Customer" };
            var invoice = new Invoice
            {
                Id = 10,
                CustomerId = 10,
                InvoiceType = InvoiceType.Sales,
                TotalAmount = 1_000_000,
                Status = InvoiceStatus.Paid
            };

            _context.Customers.Add(customer);
            _context.Invoices.Add(invoice);
            _context.SaveChanges();

            var result = _debtService.GetAllDebts();

            Assert.Empty(result);
        }

        [Fact]
        public void GetAllDebts_CustomersWithUnpaidInvoices_ReturnsCorrectDebt()
        {
            var customer = new Customer { Id = 11, CustomerName = "Unpaid Customer" };
            var invoice = new Invoice
            {
                Id = 11,
                CustomerId = 11,
                InvoiceType = InvoiceType.Sales,
                TotalAmount = 2_000_000,
                Status = InvoiceStatus.Unpaid
            };

            _context.Customers.Add(customer);
            _context.Invoices.Add(invoice);
            _context.SaveChanges();

            var result = _debtService.GetAllDebts();

            Assert.Single(result);
            Assert.Equal(2_000_000, result[0].TotalReceivable);
            Assert.Equal(0, result[0].TotalPayable);
        }

        [Fact]
        public void GetAllDebts_MultipleCustomers_CheckSortingByNetDebt()
        {
            SeedTestData(_context);

            var result = _debtService.GetAllDebts();

            Assert.Equal(2, result.Count);
            Assert.True(Math.Abs(result[0].NetDebt) >= Math.Abs(result[1].NetDebt));
        }

        //-------------------- GetDebtByCustomerId ---------------------

        [Fact]
        public void GetDebtByCustomerId_CustomerNotExist_ReturnsNull()
        {
            var result = _debtService.GetDebtByCustomerId(999);

            Assert.Null(result);
        }

        [Fact]
        public void GetDebtByCustomerId_CustomerExistsWithoutInvoices_ReturnsNull()
        {
            var customer = new Customer { Id = 20, CustomerName = "No Invoice Customer" };
            _context.Customers.Add(customer);
            _context.SaveChanges();

            var result = _debtService.GetDebtByCustomerId(20);

            Assert.Null(result);
        }

        [Fact]
        public void GetDebtByCustomerId_CustomerWithAllPaidInvoices_ReturnsNull()
        {
            var customer = new Customer { Id = 21, CustomerName = "Paid Customer" };
            var invoice = new Invoice
            {
                Id = 21,
                CustomerId = 21,
                InvoiceType = InvoiceType.Sales,
                TotalAmount = 1_000_000,
                Status = InvoiceStatus.Paid
            };

            _context.Customers.Add(customer);
            _context.Invoices.Add(invoice);
            _context.SaveChanges();

            var result = _debtService.GetDebtByCustomerId(21);

            Assert.Null(result);
        }

        [Fact]
        public void GetDebtByCustomerId_CustomerWithUnpaidInvoices_ReturnsCorrectDebt()
        {
            var customer = new Customer { Id = 22, CustomerName = "Unpaid Customer" };
            var invoice = new Invoice
            {
                Id = 22,
                CustomerId = 22,
                InvoiceType = InvoiceType.Purchase,
                TotalAmount = 3_000_000,
                Status = InvoiceStatus.Unpaid
            };

            _context.Customers.Add(customer);
            _context.Invoices.Add(invoice);
            _context.SaveChanges();

            var result = _debtService.GetDebtByCustomerId(22);

            Assert.NotNull(result);
            Assert.Equal(customer.Id, result.CustomerId);
            Assert.Equal(0, result.TotalReceivable);
            Assert.Equal(3_000_000, result.TotalPayable);
            Assert.Equal(-3_000_000, result.NetDebt);
        }

        //-------------------- GetDebtSummary ---------------------

        [Fact]
        public void GetDebtSummary_NoDebts_ReturnsAllZero()
        {
            var result = _debtService.GetDebtSummary();

            Assert.NotNull(result);
            Assert.Equal(0, result.TotalCustomers);
            Assert.Equal(0, result.TotalReceivable);
            Assert.Equal(0, result.TotalPayable);
            Assert.Equal(0, result.NetDebt);
            Assert.Equal(0, result.CustomersWithDebt);
            Assert.Equal(0, result.CustomersWithReceivable);
        }

        [Fact]
        public void GetDebtSummary_WithMultipleCustomers_ReturnsCorrectSummary()
        {
            SeedTestData(_context);

            var result = _debtService.GetDebtSummary();

            Assert.Equal(2, result.TotalCustomers);
            Assert.Equal(500_000, result.TotalReceivable);
            Assert.Equal(1_000_000, result.TotalPayable);
            Assert.Equal(-500_000, result.NetDebt);
            Assert.Equal(1, result.CustomersWithDebt);
            Assert.Equal(1, result.CustomersWithReceivable);
        }

        //-------------------- UpdateDebtFromInvoice ---------------------

        [Fact]
        public void UpdateDebtFromInvoice_InvoiceDoesNotExist_NoException()
        {
            var ex = Record.Exception(() => _debtService.UpdateDebtFromInvoice(999));

            Assert.Null(ex); 
        }

        [Fact]
        public void UpdateDebtFromInvoice_InvoiceExists_NoException()
        {
            var customer = new Customer { Id = 20, CustomerName = "Customer Test" };
            var invoice = new Invoice
            {
                Id = 20,
                CustomerId = 20,
                InvoiceType = InvoiceType.Sales,
                TotalAmount = 500_000,
                Status = InvoiceStatus.Unpaid
            };

            _context.Customers.Add(customer);
            _context.Invoices.Add(invoice);
            _context.SaveChanges();

            var ex = Record.Exception(() => _debtService.UpdateDebtFromInvoice(20));

            Assert.Null(ex);
        }

        //-------------------- GetDebtsByFilter ---------------------

        [Fact]
        public void GetDebtsByFilter_NoFilter_ReturnsAllDebts()
        {
            SeedTestData(_context);

            var result = _debtService.GetDebtsByFilter(null, null, null, null);

            Assert.Equal(2, result.Count); 
        }

        [Fact]
        public void GetDebtsByFilter_FilterByCustomerName_ReturnsCorrectCustomer()
        {
            SeedTestData(_context);

            var result = _debtService.GetDebtsByFilter("customer a", null, null, null);

            Assert.Single(result);
            Assert.Equal("Customer A", result[0].CustomerName);
        }

        [Fact]
        public void GetDebtsByFilter_FilterDebtTypeReceivable_ReturnsPositiveNetDebt()
        {
            SeedTestData(_context);

            var result = _debtService.GetDebtsByFilter(null, 1, null, null);

            Assert.All(result, d => Assert.True(d.NetDebt > 0));
        }

        [Fact]
        public void GetDebtsByFilter_FilterDebtTypePayable_ReturnsNegativeNetDebt()
        {
            var customer = new Customer { Id = 100, CustomerName = "Supplier" };
            var invoice = new Invoice
            {
                Id = 100,
                CustomerId = 100,
                InvoiceType = InvoiceType.Purchase,
                TotalAmount = 2_000_000,
                Status = InvoiceStatus.Unpaid
            };
            _context.Customers.Add(customer);
            _context.Invoices.Add(invoice);
            _context.SaveChanges();

            var result = _debtService.GetDebtsByFilter(null, 2, null, null);

            Assert.All(result, d => Assert.True(d.NetDebt < 0));
        }

        [Fact]
        public void GetDebtsByFilter_FilterDebtTypeBalanced_ReturnsZeroNetDebt()
        {
            var customer = new Customer { Id = 200, CustomerName = "Balanced" };
            var invoiceSales = new Invoice
            {
                Id = 201,
                CustomerId = 200,
                InvoiceType = InvoiceType.Sales,
                TotalAmount = 500_000,
                Status = InvoiceStatus.Unpaid
            };
            var invoicePurchase = new Invoice
            {
                Id = 202,
                CustomerId = 200,
                InvoiceType = InvoiceType.Purchase,
                TotalAmount = 500_000,
                Status = InvoiceStatus.Unpaid
            };
            _context.Customers.Add(customer);
            _context.Invoices.AddRange(invoiceSales, invoicePurchase);
            _context.SaveChanges();

            var result = _debtService.GetDebtsByFilter(null, 3, null, null);

            Assert.All(result, d => Assert.Equal(0, d.NetDebt));
        }

        [Fact]
        public void GetDebtsByFilter_FilterByAmountRange_ReturnsWithinRange()
        {
            SeedTestData(_context);

            var result = _debtService.GetDebtsByFilter(null, null, 400_000, 600_000);

            Assert.All(result, d => Assert.InRange(Math.Abs(d.NetDebt), 400_000, 600_000));
        }

        //-------------------- CalculateCustomerDebt ---------------------

        [Fact]
        public void CalculateCustomerDebt_SalesInvoiceUnpaid_CorrectTotalReceivable()
        {
            var customer = new Customer
            {
                Id = 1,
                CustomerName = "Customer A",
                Invoices = new List<Invoice>
        {
            new Invoice
            {
                Id = 101,
                InvoiceType = InvoiceType.Sales,
                TotalAmount = 1_000_000,
                Status = InvoiceStatus.Unpaid
            }
        }
            };

            _paymentServiceMock.Setup(x => x.GetTotalPaidAmount(101)).Returns(0);

            var result = InvokeCalculateCustomerDebt(customer);

            Assert.NotNull(result);
            Assert.Equal(1_000_000, result.TotalReceivable);
            Assert.Equal(0, result.TotalPayable);
            Assert.Equal(1_000_000, result.NetDebt);
        }

        [Fact]
        public void CalculateCustomerDebt_PurchaseInvoiceUnpaid_CorrectTotalPayable()
        {
            var customer = new Customer
            {
                Id = 2,
                CustomerName = "Customer B",
                Invoices = new List<Invoice>
        {
            new Invoice
            {
                Id = 102,
                InvoiceType = InvoiceType.Purchase,
                TotalAmount = 500_000,
                Status = InvoiceStatus.Unpaid
            }
        }
            };

            _paymentServiceMock.Setup(x => x.GetTotalPaidAmount(102)).Returns(0);

            var result = InvokeCalculateCustomerDebt(customer);

            Assert.NotNull(result);
            Assert.Equal(0, result.TotalReceivable);
            Assert.Equal(500_000, result.TotalPayable);
            Assert.Equal(-500_000, result.NetDebt);
        }

        [Fact]
        public void CalculateCustomerDebt_BothSalesAndPurchaseInvoices_CorrectNetDebt()
        {
            var customer = new Customer
            {
                Id = 3,
                CustomerName = "Customer C",
                Invoices = new List<Invoice>
        {
            new Invoice
            {
                Id = 103,
                InvoiceType = InvoiceType.Sales,
                TotalAmount = 1_000_000,
                Status = InvoiceStatus.Unpaid
            },
            new Invoice
            {
                Id = 104,
                InvoiceType = InvoiceType.Purchase,
                TotalAmount = 400_000,
                Status = InvoiceStatus.Unpaid
            }
        }
            };

            _paymentServiceMock.Setup(x => x.GetTotalPaidAmount(It.IsAny<int>())).Returns(0);

            var result = InvokeCalculateCustomerDebt(customer);

            Assert.NotNull(result);
            Assert.Equal(1_000_000, result.TotalReceivable);
            Assert.Equal(400_000, result.TotalPayable);
            Assert.Equal(600_000, result.NetDebt);
        }

        private DebtDto? InvokeCalculateCustomerDebt(Customer customer)
        {
            var method = typeof(DebtService).GetMethod("CalculateCustomerDebt",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

            return (DebtDto?)method.Invoke(_debtService, new object[] { customer });
        }

    }
}
