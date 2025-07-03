namespace SEP490.DB.Models
{
    public class ProductionPlanDetail
    {
        public int Id { get; set; }
        public int ProductionPlanId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public int? Producing { get; set; } = 0;
        public int Done { get; set; } = 0;
        public int? DaCatKinh { get; set; } = 0;
        public int? DaTronKeo { get; set; } = 0;
        public int? DaGiao { get; set; } = 0;
        public Product? Product { get; set; }
        public ProductionPlan? ProductionPlan { get; set; }
    }
}
