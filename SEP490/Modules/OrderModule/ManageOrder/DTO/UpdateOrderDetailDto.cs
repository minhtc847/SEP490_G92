namespace SEP490.Modules.OrderModule.ManageOrder.DTO
{
    public class UpdateOrderDetailDto
    {
        public string CustomerName { get; set; }
        public string Address { get; set; }
        public string Phone { get; set; }
        public decimal Discount { get; set; }
        public string? Status { get; set; }

        public List<UpdateProductDto> Products { get; set; }
    }

    public class UpdateProductDto
    {
        public int ProductId { get; set; }
        public string? ProductCode { get; set; }
        public string? ProductName { get; set; }
        public string? Height { get; set; }
        public string? Width { get; set; }
        public decimal? Thickness { get; set; }
        public decimal? UnitPrice { get; set; }
        public int Quantity { get; set; }
        public int? GlassStructureId { get; set; }

    }

}
