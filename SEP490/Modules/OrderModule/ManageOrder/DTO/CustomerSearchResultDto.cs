namespace SEP490.Modules.OrderModule.ManageOrder.DTO
{
    public class CustomerSearchResultDto
    {
        public int Id { get; set; }
        public string? CustomerCode { get; set; }
        public string? CustomerName { get; set; }
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public decimal? Discount { get; set; }
    }

}
