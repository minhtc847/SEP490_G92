using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.CustomerModule.DTO;
using SEP490.Modules.CustomerModule.Service;
using System.Linq;
using TestVNG.Setup;
using Xunit;

namespace TestVNG.Services
{
    public class CustomerServiceTest : TestBase
    {
        private readonly CustomerService _customerService;
        private readonly SEP490DbContext _context;

        public CustomerServiceTest()
        {
            _context = CreateInMemoryDbContext();
            _customerService = new CustomerService(_context);

            SeedTestData(_context);
        }

        //-------------------- GetAllCustomers ---------------------

        [Fact]
        public void GetAllCustomersBasic_ShouldReturnEmpty_WhenNoCustomersExist()
        {
            _context.Customers.RemoveRange(_context.Customers);
            _context.SaveChanges();

            var result = _customerService.GetAllCustomersBasic();

            Assert.NotNull(result);
            Assert.Empty(result);
        }

        [Fact]
        public void GetAllCustomersBasic_ShouldReturnCorrectData_WhenCustomersExist()
        {
            var result = _customerService.GetAllCustomersBasic();

            Assert.NotNull(result);
            Assert.Equal(_context.Customers.Count(), result.Count);
            var firstCustomer = result.First();
            Assert.Equal(_context.Customers.First().Id, firstCustomer.Id);
            Assert.Equal(_context.Customers.First().CustomerName, firstCustomer.CustomerName);
            Assert.Equal(_context.Customers.First().Phone, firstCustomer.Phone);
        }

        [Fact]
        public void GetAllCustomersBasic_ShouldContainSupplier_WhenSupplierExists()
        {

            var supplier = new Customer
            {
                Id = 100,
                CustomerName = "Supplier X",
                IsSupplier = true
            };
            _context.Customers.Add(supplier);
            _context.SaveChanges();

            var result = _customerService.GetAllCustomersBasic();

            Assert.Contains(result, c => c.Id == 100 && c.IsSupplier);
        }

        //-------------------- GetCustomerById ---------------------

        [Fact]
        public void GetCustomerById_ShouldReturnNull_WhenCustomerDoesNotExist()
        {
            int nonExistentId = 999;

            var result = _customerService.GetCustomerById(nonExistentId);

            Assert.Null(result);
        }

        [Fact]
        public void GetCustomerById_ShouldReturnCustomerDto_WhenCustomerExists()
        {
            var existingCustomer = _context.Customers.First();

            var result = _customerService.GetCustomerById(existingCustomer.Id);

            Assert.NotNull(result);
            Assert.Equal(existingCustomer.Id, result.Id);
            Assert.Equal(existingCustomer.CustomerName, result.CustomerName);
            Assert.Equal(existingCustomer.Phone, result.Phone);
            Assert.Equal(existingCustomer.Address, result.Address);
            Assert.Equal(existingCustomer.Discount, result.Discount);
            Assert.Equal(existingCustomer.IsSupplier, result.IsSupplier);
        }

        [Fact]
        public void GetCustomerById_ShouldHandleNullFieldsCorrectly()
        {
            var customerWithNulls = new Customer
            {
                Id = 500,
                CustomerName = "Null Fields Customer",
                Address = null,
                TaxCode = null,
                Phone = "0909999999"
            };
            _context.Customers.Add(customerWithNulls);
            _context.SaveChanges();

            var result = _customerService.GetCustomerById(500);

            Assert.NotNull(result);
            Assert.Equal(500, result.Id);
            Assert.Equal("Null Fields Customer", result.CustomerName);
            Assert.Null(result.Address);
            Assert.Null(result.TaxCode);
            Assert.Equal("0909999999", result.Phone);
        }

        //-------------------- AddCustomer ---------------------

        [Fact]
        public void AddCustomer_ShouldAdd_WhenNameDoesNotExist()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "New Customer",
                Phone = "0912345678",
                Address = "Hanoi",
                Discount = 10,
                IsSupplier = false
            };

            var result = _customerService.AddCustomer(dto);

            Assert.NotNull(result);
            Assert.Equal("New Customer", result.CustomerName);
            Assert.Equal("0912345678", result.Phone);
            Assert.Equal("Hanoi", result.Address);
            Assert.Equal(10, result.Discount);
            Assert.False(result.IsSupplier);
            Assert.Contains(_context.Customers, c => c.CustomerName == "New Customer");
        }

        [Fact]
        public void AddCustomer_ShouldAdd_WhenNameAlreadyExists()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Customer A",
                Phone = "0909999999",
                Address = "HCM",
                Discount = 5,
                IsSupplier = true
            };

            var result = _customerService.AddCustomer(dto);

            Assert.NotNull(result);
            Assert.Equal("Customer A", result.CustomerName);
            Assert.Equal("0909999999", result.Phone);
            Assert.True(result.IsSupplier);
            Assert.Equal(5, result.Discount);
        }

        [Fact]
        public void AddCustomer_ShouldAdd_WhenPhoneIsNull()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "No Phone Customer",
                Phone = null,
                Address = "Hue",
                Discount = 0,
                IsSupplier = false
            };

            var result = _customerService.AddCustomer(dto);

            Assert.NotNull(result);
            Assert.Null(result.Phone);
            Assert.Equal("No Phone Customer", result.CustomerName);
        }

        [Fact]
        public void AddCustomer_ShouldAdd_WhenAddressIsNull()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "No Address",
                Address = null,
                Phone = "0908888888",
                Discount = 2,
                IsSupplier = true
            };

            var result = _customerService.AddCustomer(dto);

            Assert.NotNull(result);
            Assert.Null(result.Address);
            Assert.Equal("No Address", result.CustomerName);
            Assert.True(result.IsSupplier);
        }

        [Fact]
        public void AddCustomer_ShouldAdd_WhenDiscountIsNull()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Null Discount",
                Phone = "0907777777",
                Address = "HCM",
                Discount = null,
                IsSupplier = false
            };

            var result = _customerService.AddCustomer(dto);

            Assert.NotNull(result);
            Assert.Null(result.Discount);
        }

        [Fact]
        public void AddCustomer_ShouldAdd_WhenDiscountIsValid()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Valid Discount",
                Phone = "0906666666",
                Address = "Hanoi",
                Discount = 15,
                IsSupplier = false
            };

            var result = _customerService.AddCustomer(dto);

            Assert.NotNull(result);
            Assert.Equal(15, result.Discount);
        }

        [Fact]
        public void AddCustomer_ShouldThrow_WhenDiscountIsNegative()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Negative Discount",
                Phone = "0905555555",
                Address = "Danang",
                Discount = -10,
                IsSupplier = false
            };

            var exception = Assert.Throws<ArgumentException>(() => _customerService.AddCustomer(dto));
            Assert.Equal("Discount không được âm", exception.Message);
        }

        [Fact]
        public void AddCustomer_ShouldAdd_WhenIsSupplierTrue()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Supplier Customer",
                Phone = "0904444444",
                Address = "Hanoi",
                Discount = 8,
                IsSupplier = true
            };

            var result = _customerService.AddCustomer(dto);

            Assert.NotNull(result);
            Assert.True(result.IsSupplier);
        }

        [Fact]
        public void AddCustomer_ShouldAdd_WhenIsSupplierFalse()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Normal Customer",
                Phone = "0903333333",
                Address = "Saigon",
                Discount = 5,
                IsSupplier = false
            };

            var result = _customerService.AddCustomer(dto);

            Assert.NotNull(result);
            Assert.False(result.IsSupplier);
        }

        //-------------------- UpdateCustomerById ---------------------

        [Fact]
        public void UpdateCustomer_ShouldReturnFalse_WhenIdDoesNotExist()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "New Name",
                Phone = "0903333333"
            };

            var result = _customerService.UpdateCustomerById(999, dto);

            Assert.False(result);
        }

        [Fact]
        public void UpdateCustomer_ShouldUpdate_WhenIdExists_AndNameIsUnique()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerCode = "CUST001",
                CustomerName = "Updated Customer",
                Phone = "0903333333",
                Address = "Hanoi",
                Discount = 5,
                IsSupplier = true
            };

            var result = _customerService.UpdateCustomerById(1, dto);

            Assert.True(result);

            var updatedCustomer = _context.Customers.FirstOrDefault(c => c.Id == 1);
            Assert.Equal("Updated Customer", updatedCustomer.CustomerName);
            Assert.Equal("0903333333", updatedCustomer.Phone);
            Assert.Equal("Hanoi", updatedCustomer.Address);
            Assert.True(updatedCustomer.IsSupplier);
        }

        [Fact]
        public void UpdateCustomer_ShouldAllowDuplicateName_WhenNoValidationImplemented()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Customer B",
                Phone = "0904444444"
            };

            var result = _customerService.UpdateCustomerById(1, dto);

            Assert.True(result); 
        }

        [Fact]
        public void UpdateCustomer_ShouldUpdate_WhenPhoneIsNull()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Customer Null Phone",
                Phone = null,
                Address = "HCM"
            };

            var result = _customerService.UpdateCustomerById(1, dto);

            Assert.True(result);
            var updatedCustomer = _context.Customers.FirstOrDefault(c => c.Id == 1);
            Assert.Null(updatedCustomer.Phone);
        }

        [Fact]
        public void UpdateCustomer_ShouldUpdate_WhenAddressIsNull()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Customer Null Address",
                Phone = "0905555555",
                Address = null
            };

            var result = _customerService.UpdateCustomerById(1, dto);

            Assert.True(result);
            var updatedCustomer = _context.Customers.FirstOrDefault(c => c.Id == 1);
            Assert.Null(updatedCustomer.Address);
        }

        [Fact]
        public void UpdateCustomer_ShouldUpdate_WhenDiscountIsNull()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Customer No Discount",
                Phone = "0906666666",
                Discount = null
            };

            var result = _customerService.UpdateCustomerById(1, dto);

            Assert.True(result);
            var updatedCustomer = _context.Customers.FirstOrDefault(c => c.Id == 1);
            Assert.Null(updatedCustomer.Discount);
        }

        [Fact]
        public void UpdateCustomer_ShouldUpdate_WhenDiscountIsValid()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Customer Discount Valid",
                Phone = "0907777777",
                Discount = 10
            };

            var result = _customerService.UpdateCustomerById(1, dto);

            Assert.True(result);
            var updatedCustomer = _context.Customers.FirstOrDefault(c => c.Id == 1);
            Assert.Equal(10, updatedCustomer.Discount);
        }

        [Fact]
        public void UpdateCustomer_ShouldThrow_WhenDiscountIsNegative()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Customer Discount Negative",
                Phone = "0908888888",
                Discount = -5
            };

            var exception = Assert.Throws<ArgumentException>(() => _customerService.UpdateCustomerById(1, dto));
            Assert.Equal("Discount không được âm", exception.Message);
        }

        [Fact]
        public void UpdateCustomer_ShouldUpdate_WhenIsSupplierIsTrue()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Supplier Customer",
                Phone = "0909999999",
                IsSupplier = true
            };

            var result = _customerService.UpdateCustomerById(1, dto);

            Assert.True(result);
            var updatedCustomer = _context.Customers.FirstOrDefault(c => c.Id == 1);
            Assert.True(updatedCustomer.IsSupplier);
        }

        [Fact]
        public void UpdateCustomer_ShouldUpdate_WhenIsSupplierIsFalse()
        {
            var dto = new UpdateCustomerDto
            {
                CustomerName = "Normal Customer",
                Phone = "0910000000",
                IsSupplier = false
            };

            var result = _customerService.UpdateCustomerById(1, dto);

            Assert.True(result);
            var updatedCustomer = _context.Customers.FirstOrDefault(c => c.Id == 1);
            Assert.False(updatedCustomer.IsSupplier);
        }

        //-------------------- DeleteCustomerByIdAsync ---------------------

        [Fact]
        public async Task DeleteCustomer_ShouldReturnFalse_WhenIdDoesNotExist()
        {
            int nonExistingId = 999;

            var result = await _customerService.DeleteCustomerByIdAsync(nonExistingId);

            Assert.False(result);
        }

        [Fact]
        public async Task DeleteCustomer_ShouldReturnTrue_WhenIdExistsAndNoOrders()
        {
            var customer = new Customer
            {
                Id = 100,
                CustomerName = "Customer No Orders",
                Phone = "0909999999"
            };
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            var hasOrders = _context.SaleOrders.Any(o => o.CustomerId == customer.Id);
            Assert.False(hasOrders);

            var result = await _customerService.DeleteCustomerByIdAsync(customer.Id);

            Assert.True(result);
            var deletedCustomer = await _context.Customers.FindAsync(customer.Id);
            Assert.Null(deletedCustomer);
        }

        [Fact]
        public async Task DeleteCustomer_ShouldThrow_WhenCustomerHasOrders()
        {
            int existingCustomerWithOrder = 1;

            var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                _customerService.DeleteCustomerByIdAsync(existingCustomerWithOrder));

            Assert.Equal("Không thể xoá khách hàng đang có đơn hàng.", exception.Message);
        }

        //-------------------- CheckCustomerHasOrdersAsync ---------------------

        [Fact]
        public async Task CheckCustomerHasOrders_ShouldReturnTrue_WhenCustomerHasOrders()
        {
            int customerIdWithOrders = 1; 

            var result = await _customerService.CheckCustomerHasOrdersAsync(customerIdWithOrders);

            Assert.True(result);
        }

        [Fact]
        public async Task CheckCustomerHasOrders_ShouldReturnFalse_WhenCustomerHasNoOrders()
        {
            var newCustomer = new SEP490.DB.Models.Customer
            {
                Id = 100,
                CustomerName = "Customer No Orders",
                Phone = "0903333333"
            };
            _context.Customers.Add(newCustomer);
            await _context.SaveChangesAsync();

            var result = await _customerService.CheckCustomerHasOrdersAsync(newCustomer.Id);

            Assert.False(result);
        }

        [Fact]
        public async Task CheckCustomerHasOrders_ShouldReturnFalse_WhenCustomerDoesNotExist()
        {
            int nonExistingCustomerId = 999;

            var result = await _customerService.CheckCustomerHasOrdersAsync(nonExistingCustomerId);

            Assert.False(result);
        }
    }
}
