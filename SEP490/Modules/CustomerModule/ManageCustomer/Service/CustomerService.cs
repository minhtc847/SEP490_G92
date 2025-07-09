using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.CustomerModule.ManageCustomer.DTO;

namespace SEP490.Modules.CustomerModule.ManageCustomer.Service
{
    public class CustomerService : BaseService, ICustomerService
    {
        private readonly SEP490DbContext _context;

        public CustomerService(SEP490DbContext context)
        {
            _context = context;
        }
        public List<CustomerListDto> GetAllCustomersBasic()
        {
            return _context.Customers
                .Select(c => new CustomerListDto
                {
                    Id = c.Id,
                    CustomerCode = c.CustomerCode,
                    CustomerName = c.CustomerName,
                    Phone = c.Phone,
                    Address = c.Address,
                    IsSupplier = c.IsSupplier,
                    Discount = c.Discount
                })
                .ToList();
        }
        public CustomerDto? GetCustomerById(int id)
        {
            var customer = _context.Customers.FirstOrDefault(c => c.Id == id);

            if (customer == null) return null;

            return new CustomerDto
            {
                Id = customer.Id,
                CustomerCode = customer.CustomerCode,
                CustomerName = customer.CustomerName,
                Address = customer.Address,
                Debt = customer.Debt,
                TaxCode = customer.TaxCode,
                ContactPerson = customer.ContactPerson,
                Phone = customer.Phone,
                Discount = customer.Discount,
                IsSupplier = customer.IsSupplier,
                ZalopId = customer.ZaloId,
                ZaloName = customer.ZaloName,
                TagName = customer.TagName
            };
        }
        public Customer AddCustomer(UpdateCustomerDto dto)
        {
            var customer = new Customer
            {
                CustomerCode = dto.CustomerCode,
                CustomerName = dto.CustomerName,
                Address = dto.Address,
                Debt = dto.Debt,
                TaxCode = dto.TaxCode,
                ContactPerson = dto.ContactPerson,
                Phone = dto.Phone,
                Discount = dto.Discount,
                IsSupplier = dto.IsSupplier,
                ZaloId = dto.ZalopId,
                ZaloName = dto.ZaloName,
                TagName = dto.TagName
            };

            _context.Customers.Add(customer);
            _context.SaveChanges();

            return customer;
        }

        public bool UpdateCustomerById(int id, UpdateCustomerDto dto)
        {
            var customer = _context.Customers.FirstOrDefault(c => c.Id == id);
            if (customer == null) return false;

            customer.CustomerCode = dto.CustomerCode;
            customer.CustomerName = dto.CustomerName;
            customer.Address = dto.Address;
            customer.Debt = dto.Debt;
            customer.TaxCode = dto.TaxCode;
            customer.ContactPerson = dto.ContactPerson;
            customer.Phone = dto.Phone;
            customer.Discount = dto.Discount;
            customer.IsSupplier = dto.IsSupplier;
            customer.ZaloId = dto.ZalopId;
            customer.ZaloName = dto.ZaloName;
            customer.TagName = dto.TagName;

            _context.SaveChanges();
            return true;
        }
        public async Task<bool> DeleteCustomerByIdAsync(int id)
        {
            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Id == id);
            if (customer == null) return false;

            if (await _context.SaleOrders.AnyAsync(o => o.CustomerId == id))
            {
                throw new InvalidOperationException("Không thể xoá khách hàng đang có đơn hàng.");
            }

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CheckCustomerHasOrdersAsync(int customerId)
        {
            return await _context.SaleOrders.AnyAsync(o => o.CustomerId == customerId);
        }


    }
}
