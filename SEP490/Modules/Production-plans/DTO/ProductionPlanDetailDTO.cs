namespace SEP490.Modules.Production_plans.DTO
{
    public class ProductionPlanDetailDTO
    {
        public int Id { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public decimal? Thickness { get; set; }
        public string? Height { get; set; }
        public string? Width { get; set; }
        public int? Quantity { get; set; }
        public int? InProgressQuantity { get; set; }
        public int? Completed { get; set; }
    }
}
