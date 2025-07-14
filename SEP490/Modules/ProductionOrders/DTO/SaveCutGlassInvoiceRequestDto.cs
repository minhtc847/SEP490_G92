namespace SEP490.Modules.ProductionOrders.DTO
{
    public class SaveCutGlassInvoiceRequestDto
    {
        public int productionOrderId { get; set; }
        public List<MaterialBlockDto> materials { get; set; } = new();
    }
    
    public class MaterialBlockDto
    {
        public int materialId { get; set; }
        public string materialName { get; set; } = string.Empty;
        public decimal width { get; set; }
        public decimal height { get; set; }
        public decimal thickness { get; set; }
        public int quantity { get; set; }
        public int materialType { get; set; }
        public List<MaterialItemDto> materials { get; set; } = new();
    }
    
    public class MaterialItemDto
    {
        public long id { get; set; }
        public string name { get; set; } = string.Empty;
        public string length { get; set; } = string.Empty;
        public string width { get; set; } = string.Empty;
        public string thickness { get; set; } = string.Empty;
        public string quantity { get; set; } = string.Empty;
        public List<CutGlassItemDto> products { get; set; } = new();
        public List<CutGlassItemDto> wastes { get; set; } = new();
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