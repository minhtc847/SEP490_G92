namespace SEP490.Modules.Production_plans.DTO
{
    public class CreateProductionPlanFromSaleOrderDTO
    {
        public int SaleOrderId { get; set; }
        public List<ProductionPlanProductInputDTO> Products { get; set; } = new();
    }

    public class ProductionPlanProductInputDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public int Thickness { get; set; }
        public int GlueLayers { get; set; }
        public int GlassLayers { get; set; }
        public int Glass4mm { get; set; }
        public int Glass5mm { get; set; }
        public int ButylType { get; set; }
        public bool IsCuongLuc { get; set; }
    }
} 