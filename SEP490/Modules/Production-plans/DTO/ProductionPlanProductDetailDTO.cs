namespace SEP490.Modules.Production_plans.DTO
{
    public class ProductionPlanProductDetailDTO
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int TotalQuantity { get; set; }
        public int InProduction { get; set; }
        public int Completed { get; set; }
        public int DaCatKinh { get; set; }
        public int DaTronKeo { get; set; }
        public int DaGiao { get; set; }
    }
} 