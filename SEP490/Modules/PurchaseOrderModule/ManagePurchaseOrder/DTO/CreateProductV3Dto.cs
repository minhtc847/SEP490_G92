namespace SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.DTO
{
    public class CreateProductV3Dto
    {
        public string ProductName { get; set; } = null!;
        public string? ProductType { get; set; } = "NVL";
        public string? UOM { get; set; } = "Tấm";
        public string Height { get; set; } = null!;
        public string Width { get; set; } = null!;
        public decimal Thickness { get; set; }
        public decimal? Weight { get; set; } = null;
        public decimal UnitPrice { get; set; }
        public int? GlassStructureId { get; set; }
    }
}
