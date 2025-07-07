namespace SEP490.Modules.CustomerModule.ManageCustomer.DTO
{
    public class CustomerListDto
    {
        public int Id { get; set; }
        public string? CustomerCode { get; set; }
        public string? CustomerName { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public bool IsSupplier { get; set; }
        public decimal? Discount { get; set; }
    }
}
