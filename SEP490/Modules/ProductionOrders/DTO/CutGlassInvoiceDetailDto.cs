namespace SEP490.Modules.ProductionOrders.DTO
{
    public class CutGlassInvoiceDetailDto
    {
        public string BlockName { get; set; } = string.Empty;
        public List<MaterialBlockDto> Materials { get; set; } = new();
    }

    public class CutGlassMaterialDto
    {
        public string MaterialName { get; set; } = string.Empty;
        public int MaterialType { get; set; }
        public int Quantity { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
    }
} 