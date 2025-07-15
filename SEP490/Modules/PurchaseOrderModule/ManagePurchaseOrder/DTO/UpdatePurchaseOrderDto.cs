namespace SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.DTO
{
    public class UpdatePurchaseOrderDto
    {
        public string CustomerName { get; set; } = null!;
        public string? Description { get; set; }
        public string? Status { get; set; }
        public List<UpdatePurchaseOrderDetailDto> Products { get; set; } = new();
    }

    public class UpdatePurchaseOrderDetailDto
    {
        public int? ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public decimal? Width { get; set; }
        public decimal? Height { get; set; }
        public decimal? Thickness { get; set; }
        public int Quantity { get; set; }
    }
}
