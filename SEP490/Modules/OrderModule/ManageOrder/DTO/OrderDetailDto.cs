namespace SEP490.Modules.OrderModule.ManageOrder.DTO
{
    public class ProductInOrderDto
    {
        public int ProductId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public decimal Height { get; set; }
        public decimal Width { get; set; }
        public decimal Thickness { get; set; }
        public decimal AreaM2 { get; set; }
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class OrderDetailDto
    {
        public string OrderCode { get; set; }
        public DateTime OrderDate { get; set; }
        public string CustomerName { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public decimal Discount { get; set; }
        public List<ProductInOrderDto> Products { get; set; } 
        public int TotalQuantity { get; set; }
        public decimal TotalAmount { get; set; }
        public string? Status { get; set; }
    }

}
