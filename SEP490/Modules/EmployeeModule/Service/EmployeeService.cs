using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.Modules.EmployeeModule.DTO;

namespace SEP490.Modules.EmployeeModule.Service
{
    public class EmployeeService : IEmployeeService
    {
        private readonly SEP490DbContext _context;

        public EmployeeService(SEP490DbContext context)
        {
            _context = context;
        }

        public List<EmployeeListDto> GetAllEmployeesBasic()
        {
            return _context.Employees
                .Select(e => new EmployeeListDto
                {
                    Id = e.Id,
                    FullName = e.FullName,
                    Phone = e.Phone,
                    Email = e.Email,
                    Address = e.Address,
                    HasAccount = _context.Accounts.Any(a => a.EmployeeId == e.Id && a.IsActive)
                })
                .ToList();
        }

        public EmployeeDto? GetEmployeeById(int id)
        {
            var employee = _context.Employees
                .Where(e => e.Id == id)
                .Select(e => new EmployeeDto
                {
                    Id = e.Id,
                    FullName = e.FullName,
                    Phone = e.Phone,
                    Email = e.Email,
                    Address = e.Address,
                    HasAccount = _context.Accounts.Any(a => a.EmployeeId == e.Id && a.IsActive)
                })
                .FirstOrDefault();

            return employee;
        }

        public EmployeeDto AddEmployee(UpdateEmployeeDto dto)
        {
            var employee = new SEP490.DB.Models.Employee
            {
                FullName = dto.FullName,
                Phone = dto.Phone,
                Email = dto.Email,
                Address = dto.Address
            };

            _context.Employees.Add(employee);
            _context.SaveChanges();

            return new EmployeeDto
            {
                Id = employee.Id,
                FullName = employee.FullName,
                Phone = employee.Phone,
                Email = employee.Email,
                Address = employee.Address,
                HasAccount = false
            };
        }

        public bool UpdateEmployeeById(int id, UpdateEmployeeDto dto)
        {
            var employee = _context.Employees.Find(id);
            if (employee == null)
                return false;

            employee.FullName = dto.FullName;
            employee.Phone = dto.Phone;
            employee.Email = dto.Email;
            employee.Address = dto.Address;

            _context.SaveChanges();
            return true;
        }

        public async Task<bool> DeleteEmployeeByIdAsync(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
                return false;

            // Check if employee has an active account
            var hasAccount = await _context.Accounts.AnyAsync(a => a.EmployeeId == id && a.IsActive);
            if (hasAccount)
            {
                throw new InvalidOperationException("Không thể xoá nhân viên đã có tài khoản. Vui lòng xoá tài khoản trước.");
            }

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CheckEmployeeHasAccountAsync(int id)
        {
            return await _context.Accounts.AnyAsync(a => a.EmployeeId == id && a.IsActive);
        }
    }
}
