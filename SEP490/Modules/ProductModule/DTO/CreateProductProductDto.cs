namespace SEP490.Modules.ProductModule.DTO
{
    public class CreateProductProductDto
    {
        public string? ProductCode { get; set; }
        public string? ProductName { get; set; }
        public string? ProductType { get; set; }
        public string? UOM { get; set; }
        public string? Height { get; set; }
        public string? Width { get; set; }
        public decimal? Thickness { get; set; }
        public decimal? Weight { get; set; }
        public decimal? UnitPrice { get; set; }
        public int? GlassStructureId { get; set; }
        public int isupdatemisa { get; set; } = 0; // 0 = chưa cập nhật, 1 = đã cập nhật
    }
}
