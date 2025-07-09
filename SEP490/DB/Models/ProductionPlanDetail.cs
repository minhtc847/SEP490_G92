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

        public string? UOM { get; set; } = string.Empty;
        public int? Doday { get; set; }
        public int? SoLopKeo { get; set; }
        public int? SoLopKinh { get; set; }
        public int? Kinh4 { get; set; } = 0;
        public int? Kinh5 { get; set; } = 0;
        public int? IsKinhCuongLuc { get; set; } = 0;
        public int? LoaiButyl { get; set; } = 0;

        public decimal? TongKeoNano { get; set; } = 0;
        public decimal? TongKeoMem { get; set; } = 0;
        public decimal? DoDaiButyl { get; set; } = 0;

        public int? DaCatKinh { get; set; } = 0;
        public int? DaGhepKinh { get; set; } = 0;
        public int? DaTronKeo { get; set; } = 0;
        public int? DaDoKeo { get; set; } = 0;
        public int? DaGiao { get; set; } = 0;
        public Product? Product { get; set; }
        public ProductionPlan? ProductionPlan { get; set; }
    }
}
