using SEP490.DB.Models;
using SEP490.Modules.CustomerModule.ManageCustomer.DTO;

namespace SEP490.Modules.CustomerModule.ManageCustomer.Service
{
    public interface ICustomerService
    {
        List<CustomerListDto> GetAllCustomersBasic();

        CustomerDto? GetCustomerById(int id);
        bool UpdateCustomerById(int id, UpdateCustomerDto dto);
        Customer AddCustomer(UpdateCustomerDto dto);
        Task<bool> DeleteCustomerByIdAsync(int id);
        Task<bool> CheckCustomerHasOrdersAsync(int customerId);
    }
}
