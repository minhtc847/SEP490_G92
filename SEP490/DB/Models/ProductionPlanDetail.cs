namespace SEP490.DB.Models
{
    public class ProductionPlanDetail
    {
        public int Id { get; set; }
        public int ProductionPlanId { get; set; }
        public int ProductId { get; set; }
        public int Producing { get; set; }
        public int Done { get; set; }
        public Product? Product { get; set; }
        public ProductionPlan? ProductionPlan { get; set; }
    }
}
