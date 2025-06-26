namespace SEP490.Modules.ProductionOrders.DTO
{
    public class ProductionOrdersByPlanDto
    {
        public int ProductionOrderId { get; set; }
        public string? ProductionOrderCode { get; set; }
        public DateTime OrderDate { get; set; }

        public List<string> ProductCodes { get; set; } = new List<string>();
        
        public int TotalAmount { get; set; }
        public string? Description { get; set; }
        public string? ProductionStatus { get; set; }
    }
}
