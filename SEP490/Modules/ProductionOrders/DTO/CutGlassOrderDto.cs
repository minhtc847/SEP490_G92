namespace SEP490.Modules.ProductionOrders.DTO
{
    public class CutGlassOrderDto
    {
        public int ProductionPlanId { get; set; }
        public Dictionary<int, int> ProductQuantities { get; set; } = new Dictionary<int, int>(); // Key: ProductionPlanDetailId, Value: Quantity
        public List<FinishedProductDto> FinishedProducts { get; set; } = new List<FinishedProductDto>();
    }

    public class FinishedProductDto
    {
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
} 