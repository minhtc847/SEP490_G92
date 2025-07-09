namespace SEP490.Modules.Production_plans.DTO
{
    public class ProductionPlanMaterialProductDTO
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string Width { get; set; }
        public string Height { get; set; }
        public int Quantity { get; set; }
        public int Thickness { get; set; }
        public int GlueLayers { get; set; }
        public int GlassLayers { get; set; }
        public int Glass4mm { get; set; }
        public int Glass5mm { get; set; }
        public int ButylType { get; set; }
        public decimal TotalGlue { get; set; }
        public decimal ButylLength { get; set; }
        public bool IsCuongLuc { get; set; }
    }

    public class ProductionPlanMaterialDetailDTO
    {
        public decimal TotalKeoNano { get; set; }
        public decimal ChatA { get; set; }
        public decimal KOH { get; set; }
        public decimal H2O { get; set; }
        public decimal TotalKeoMem { get; set; }
        public decimal NuocLieu { get; set; }
        public decimal A { get; set; }
        public decimal B { get; set; }
        public List<ProductionPlanMaterialProductDTO> Products { get; set; } = new();
    }
} 