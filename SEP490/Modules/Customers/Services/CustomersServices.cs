using SEP490.DB;
using SEP490.DB.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using SEP490.Common.Services;

namespace SEP490.Modules.Customers.Services
{
    public class CustomersServices : BaseService, ICustomersServices
    {
        private readonly SEP490DbContext _context;

        public CustomersServices(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<List<Customer>> GetCustomersWithZaloIdAsync()
        {
            return await _context.Customers
                .Where(c => c.ZaloId != null)
                .ToListAsync();
        }
    }
}
