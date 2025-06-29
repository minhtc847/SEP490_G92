using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;

namespace SEP490.DB.Models
{
    public class Account
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string UserName { get; set; }
        public string PasswordHash { get; set; }
        public int RoleId { get; set; }
        public Employee Employee { get; set; }
        public Role Role { get; set; }
    }
}
