using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SEP490.Common.Attributes;
using SEP490.Common.Constants;
using SEP490.Modules.EmployeeModule.DTO;
using SEP490.Modules.EmployeeModule.Service;

namespace SEP490.Modules.EmployeeModule.Controller
{
    [Route("api/employees")]
    [ApiController]
    [Authorize]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        [AuthorizeRoles(Roles.MANAGER, Roles.ACCOUNTANT)]
        public ActionResult<List<EmployeeListDto>> GetAllBasic()
        {
            var employees = _employeeService.GetAllEmployeesBasic();
            return Ok(employees);
        }

        [HttpGet("{id}")]
        public ActionResult<EmployeeDto> GetById(int id)
        {
            var employee = _employeeService.GetEmployeeById(id);
            if (employee == null)
            {
                return NotFound();
            }
            return Ok(employee);
        }

        [HttpPost]
        [AuthorizeRoles(Roles.MANAGER)]
        public IActionResult CreateEmployee([FromBody] UpdateEmployeeDto dto)
        {
            var createdEmployee = _employeeService.AddEmployee(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdEmployee.Id }, createdEmployee);
        }

        [HttpPut("{id}")]
        [AuthorizeRoles(Roles.MANAGER)]
        public IActionResult UpdateEmployee(int id, [FromBody] UpdateEmployeeDto dto)
        {
            var success = _employeeService.UpdateEmployeeById(id, dto);
            if (!success)
                return NotFound(new { message = $"Không tìm thấy nhân viên với id = {id}" });

            return Ok(new { message = "Cập nhật nhân viên thành công." });
        }

        [HttpDelete("{id}")]
        [AuthorizeRoles(Roles.MANAGER)]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            try
            {
                var result = await _employeeService.DeleteEmployeeByIdAsync(id);

                if (!result)
                    return NotFound(new { message = "Không tìm thấy nhân viên với ID này." });

                return Ok(new { message = "Xoá nhân viên thành công." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/has-account")]
        public async Task<IActionResult> CheckEmployeeHasAccount(int id)
        {
            var result = await _employeeService.CheckEmployeeHasAccountAsync(id);
            return Ok(result);
        }
    }
}
