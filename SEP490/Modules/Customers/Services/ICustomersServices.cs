using SEP490.DB.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SEP490.Modules.Customers.Services
{
    public interface ICustomersServices
    {
        Task<List<Customer>> GetCustomersWithZaloIdAsync();
    }
}
