namespace SEP490.Modules.Production_plans.DTO
{
    public class ProductionPlanDTO
    {
        public int Id { get; set; }
        public string PlanDate { get; set; } = string.Empty;
        public string OrderCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public int? Quantity { get; set; }
        public string? Status { get; set; }
    }
}
