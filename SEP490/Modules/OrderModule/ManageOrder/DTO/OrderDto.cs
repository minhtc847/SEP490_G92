namespace SEP490.Modules.OrderModule.ManageOrder.DTO
{
    public class OrderDto
    {
        public int Id { get; set; }
        public string CustomerName { get; set; }
        public string OrderCode { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; }
        public decimal Discount { get; set; }
        public decimal OriginalTotalAmount { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
