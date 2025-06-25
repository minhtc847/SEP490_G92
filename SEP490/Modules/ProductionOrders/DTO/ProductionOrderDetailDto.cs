namespace SEP490.Modules.ProductionOrders.DTO
{
    public class ProductionOrderDetailDto
    {
        public int ProductionOrderId { get; set; }
        public string? ProductionOrderCode { get; set; }
        public string? ProductName { get; set; }
        public int ProductId { get; set; } 
        public int? AdhesiveLayers { get; set; }
        public int? GlassLayers { get; set; }
        public decimal? Thickness { get; set; }
        public string? Width { get; set; }
        public string? Height { get; set; }
        public decimal ButylThickness { get; set; }
        public decimal Quantity { get; set; }
    }
} 