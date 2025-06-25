namespace SEP490.Modules.Production_plans.DTO
{
    public class ProductionPlanDetailDTO
    {
        public int Id { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int? Quantity { get; set; }
        public int? InProgressQuantity { get; set; }
        public int? Completed { get; set; }
    }
}
