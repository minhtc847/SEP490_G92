namespace SEP490.Modules.ProductionOrders.DTO
{
    public class ProductionOrderListDto
    {
        public string? ProductionOrderCode { get; set; }
        public string? OrderCode { get; set; }
        public string? CustomerName { get; set; }
        public int TotalAmount { get; set; }
    }
} 