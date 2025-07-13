namespace SEP490.Modules.ProductionOrders.DTO
{
    public class SaveCutGlassInvoiceRequestDto
    {
        public int ProductionOrderId { get; set; }
        public List<MaterialBlockDto> Materials { get; set; } = new();
    }
    public class MaterialBlockDto
    {
        public int MaterialId { get; set; }
        public string MaterialName { get; set; } = string.Empty;
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public decimal Thickness { get; set; }
        public int Quantity { get; set; }
        public List<CutGlassItemDto> Products { get; set; } = new();
        public List<CutGlassItemDto> Wastes { get; set; } = new();
    }
    public class CutGlassItemDto
    {
        public string OutputName { get; set; } = string.Empty;
        public int OutputType { get; set; }
        public int Quantity { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public bool IsWaste { get; set; }
    }
} 