using Microsoft.Extensions.Configuration;
using SEP490.DB;
using SEP490.Modules.Auth.Services;
using SEP490.Modules.ProductModule.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TestVNG.Setup;

namespace TestVNG.Serivces
{
    internal class ProductServicesTest : TestBase
    {
        private readonly ProductService _productService;
        private readonly SEP490DbContext _context;
        private readonly IConfiguration _configuration;

        public ProductServicesTest()
        {
            _context = CreateInMemoryDbContext();
            _configuration = CreateMockConfiguration();
            _productService = new ProductService(_context);

            // Seed test data
            SeedTestData(_context);
        }

    }
}
