namespace SEP490.Modules.OrderModule.ManageOrder.DTO
{
    public class CreateProductV2Dto
    {
        public string ProductName { get; set; } = null!;
        public string? ProductType { get; set; } = "Thành Phẩm";
        public string? UOM { get; set; } = "Tấm";
        public string Height { get; set; } = null!;
        public string Width { get; set; } = null!;
        public decimal Thickness { get; set; }
        public decimal? Weight { get; set; } = null;
        public decimal UnitPrice { get; set; }
        public int? GlassStructureId { get; set; }
    }
}
