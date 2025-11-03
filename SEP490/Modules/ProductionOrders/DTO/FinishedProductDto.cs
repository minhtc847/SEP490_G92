namespace SEP490.Modules.ProductionOrders.DTO
{
    public class FinishedProductDto
    {
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public int? OutputFor { get; set; } // ID của ProductionPlanDetail mà output này phục vụ
    }
} 