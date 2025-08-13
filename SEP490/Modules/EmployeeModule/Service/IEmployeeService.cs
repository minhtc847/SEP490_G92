using SEP490.Modules.EmployeeModule.DTO;

namespace SEP490.Modules.EmployeeModule.Service
{
    public interface IEmployeeService
    {
        List<EmployeeListDto> GetAllEmployeesBasic();
        EmployeeDto? GetEmployeeById(int id);
        EmployeeDto AddEmployee(UpdateEmployeeDto dto);
        bool UpdateEmployeeById(int id, UpdateEmployeeDto dto);
        Task<bool> DeleteEmployeeByIdAsync(int id);
        Task<bool> CheckEmployeeHasAccountAsync(int id);
    }
}
