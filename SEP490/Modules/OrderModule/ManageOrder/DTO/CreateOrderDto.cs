namespace SEP490.Modules.OrderModule.ManageOrder.DTO
{
    public class CreateOrderDto
    {
        public string CustomerName { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string Phone { get; set; } = null!;
        public string OrderCode { get; set; } = null!;
        public DateTime OrderDate { get; set; }
        public decimal Discount { get; set; }
        public string Status { get; set; } = null!;
        public List<CreateProductDto> Products { get; set; } = new();
    }

    public class CreateProductDto
    {
        public int ProductId { get; set; }
        public string ProductCode { get; set; } = null!;
        public string ProductName { get; set; } = null!;
        public string Height { get; set; } = null!;
        public string Width { get; set; } = null!;
        public decimal Thickness { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public int? GlassStructureId { get; set; }
    }

}
