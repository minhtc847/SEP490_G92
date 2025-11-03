namespace SEP490.Modules.PurchaseOrderModule.DTO
{
    public class CreateProductV3Dto
    {
        public string ProductName { get; set; } = null!;
        public string? ProductType { get; set; } = "NVL";
        public string? UOM { get; set; } = null;
        public string? Height { get; set; } = null;
        public string? Width { get; set; } = null;
        public decimal? Thickness { get; set; } = null;
        public decimal? Weight { get; set; } = null;
        public decimal? UnitPrice { get; set; } = null;
        public int? GlassStructureId { get; set; } = null;
        public int? isupdatemisa { get; set; } = 0;
    }

}
