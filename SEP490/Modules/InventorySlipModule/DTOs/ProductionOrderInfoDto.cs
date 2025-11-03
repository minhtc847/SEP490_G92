namespace SEP490.Modules.InventorySlipModule.DTOs
{
    public class ProductionOrderInfoDto
    {
        public int Id { get; set; }
        public string ProductionOrderCode { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Status { get; set; }
        public List<ProductionOutputDto> ProductionOutputs { get; set; } = new();
        public List<ProductInfoDto> AvailableProducts { get; set; } = new();
        public List<ProductInfoDto> RawMaterials { get; set; } = new();
        public List<ProductInfoDto> SemiFinishedProducts { get; set; } = new();
        public List<ProductInfoDto> GlassProducts { get; set; } = new();
    }

    public class ProductInfoDto
    {
        public int Id { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string ProductType { get; set; } = string.Empty;
        public string? Uom { get; set; }
        public string? Height { get; set; }
        public string? Width { get; set; }
        public decimal? Thickness { get; set; }
        public decimal? Weight { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
    }
}
