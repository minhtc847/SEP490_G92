namespace SEP490.Modules.ProductionOrders.DTO
{
    public class GlueGlassOrderDto
    {
        public int ProductionPlanId { get; set; }
        public Dictionary<int, int> ProductQuantities { get; set; } = new Dictionary<int, int>(); // Key: ProductionPlanDetailId, Value: Quantity
        public List<FinishedProductDto> FinishedProducts { get; set; } = new List<FinishedProductDto>();
    }
} 