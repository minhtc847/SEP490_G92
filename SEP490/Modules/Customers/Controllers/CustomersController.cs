using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.Customers.Services;
using System.Threading.Tasks;

namespace SEP490.Modules.Customers.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomersServices _customersServices;

        public CustomersController(ICustomersServices customersServices)
        {
            _customersServices = customersServices;
        }

        [HttpGet("with-zalo-id")]
        public async Task<IActionResult> GetCustomersWithZaloId()
        {
            var customers = await _customersServices.GetCustomersWithZaloIdAsync();
            return Ok(customers);
        }
    }
}
