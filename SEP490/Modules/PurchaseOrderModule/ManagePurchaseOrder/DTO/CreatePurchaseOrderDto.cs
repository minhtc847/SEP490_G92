namespace SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.DTO
{
    public class CreatePurchaseOrderDto
    {
        public string CustomerName { get; set; }
        public string? Description { get; set; }
        public string? Code { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
        public List<CreatePurchaseOrderDetailDto> Products { get; set; }

        // Add the missing property to fix the error  
        public DateTime CreatedDate { get; set; }
    }

    public class CreatePurchaseOrderDetailDto
    {
        public string ProductName { get; set; } = default!;
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public decimal Thickness { get; set; }
        public int Quantity { get; set; }
    }

}
