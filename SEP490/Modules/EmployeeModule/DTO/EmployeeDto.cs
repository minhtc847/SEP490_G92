namespace SEP490.Modules.EmployeeModule.DTO
{
    public class EmployeeListDto
    {
        public int Id { get; set; }
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public bool HasAccount { get; set; }
    }

    public class EmployeeDto
    {
        public int Id { get; set; }
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public bool HasAccount { get; set; }
    }

    public class UpdateEmployeeDto
    {
        public string? FullName { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
    }
}
