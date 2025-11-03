namespace SEP490.Modules.Production_plans.DTO
{
    public class ProductionPlanOutputDto
    {
        public int OutputId { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal? TotalAmount { get; set; }
        public decimal? Done { get; set; }
        public decimal? Broken { get; set; }
        public string? BrokenDescription { get; set; }
    }
} 