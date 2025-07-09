namespace SEP490.Modules.CustomerModule.ManageCustomer.DTO
{
    public class UpdateCustomerDto
    {
        public string? CustomerCode { get; set; }
        public string? CustomerName { get; set; }
        public string? Address { get; set; }
        public decimal? Debt { get; set; }
        public string? TaxCode { get; set; }
        public string? ContactPerson { get; set; }
        public string? Phone { get; set; }
        public decimal? Discount { get; set; }
        public bool IsSupplier { get; set; }
        public string? ZalopId { get; set; }
        public string? ZaloName { get; set; }
        public string? TagName { get; set; }
    }
}
