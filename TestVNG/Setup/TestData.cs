using SEP490.DB.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestVNG.Setup
{
    internal class TestData
    {

        public static List<Role> GetRoles()
        {
            return new List<Role>
            {
                new Role { Id = 1, RoleName = "Admin", Description = "Administrator" },
                new Role { Id = 2, RoleName = "User", Description = "Regular User" },
                new Role { Id = 3, RoleName = "Manager", Description = "Manager" }
            };
        }

        public static List<Employee> GetEmployees()
        {
            return new List<Employee>
            {
                new Employee { Id = 1, FullName = "John Doe", Email = "john@example.com" },
                new Employee { Id = 2, FullName = "Jane Smith", Email = "jane@example.com" }
            };
        }

        public static List<Account> GetAccounts()
        {
            return new List<Account>
            {
                new Account
                {
                    Id = 1,
                    UserName = "admin",
                    PasswordHash = "hashed_password_here",
                    EmployeeId = 1,
                    RoleId = 1
                },
                new Account
                {
                    Id = 2,
                    UserName = "user",
                    PasswordHash = "hashed_password_here",
                    EmployeeId = 2,
                    RoleId = 2
                }
            };
        }
    }
}
