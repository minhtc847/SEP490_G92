using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEP490.Common.Attributes;
using SEP490.Common.Constants;
using SEP490.Modules.CustomerModule.DTO;
using SEP490.Modules.CustomerModule.Service;

namespace SEP490.Modules.CustomerModule.Controller
{
    [Route("api/customers")]
    [ApiController]
    [Authorize] // Yêu cầu authentication
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomerController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet]
        [AuthorizeRoles( Roles.MANAGER,  Roles.ACCOUNTANT)]
        public ActionResult<List<CustomerListDto>> GetAllBasic()
        {
            var customers = _customerService.GetAllCustomersBasic();
            return Ok(customers);
        }

        [HttpGet("{id}")]
        public ActionResult<CustomerDto> GetById(int id)
        {
            var customer = _customerService.GetCustomerById(id);
            if (customer == null)
            {
                return NotFound();
            }
            return Ok(customer);
        }

        [HttpPost]
        [AuthorizeRoles( Roles.MANAGER, Roles.ACCOUNTANT)]
        public IActionResult CreateCustomer([FromBody] UpdateCustomerDto dto)
        {
            var createdCustomer = _customerService.AddCustomer(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdCustomer.Id }, createdCustomer);
        }

        [HttpPut("{id}")]
        public IActionResult UpdateCustomer(int id, [FromBody] UpdateCustomerDto dto)
        {
            var success = _customerService.UpdateCustomerById(id, dto);
            if (!success)
                return NotFound(new { message = $"Không tìm thấy khách hàng với id = {id}" });

            return Ok(new { message = "Cập nhật khách hàng thành công." });
        }

        [HttpDelete("{id}")]
        [AuthorizeRoles(Roles.MANAGER)]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            try
            {
                var result = await _customerService.DeleteCustomerByIdAsync(id);

                if (!result)
                    return NotFound(new { message = "Không tìm thấy khách hàng với ID này." });

                return Ok(new { message = "Xoá khách hàng thành công." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }



        [HttpGet("{id}/has-orders")]
        public async Task<IActionResult> CheckCustomerHasOrders(int id)
        {
            var result = await _customerService.CheckCustomerHasOrdersAsync(id);
            return Ok(result);
        }
    }
}
