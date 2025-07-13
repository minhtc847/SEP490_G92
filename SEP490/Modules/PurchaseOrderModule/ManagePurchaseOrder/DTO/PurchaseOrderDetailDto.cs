namespace SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.DTO
{
    public class PurchaseOrderDetailDto
    {
        public int? ProductId { get; set; }
        public string? ProductCode { get; set; }
        public string? ProductName { get; set; }             // từ Product
        public string? ProductType { get; set; }
        public string? UOM { get; set; }
        public string? Height { get; set; }
        public string? Width { get; set; }
        public decimal? Thickness { get; set; }
        public decimal? Weight { get; set; }

        public int? GlassStructureId { get; set; }
        public string? GlassStructureName { get; set; }      // từ GlassStructure.ProductName

        public int? Quantity { get; set; }                   // từ PurchaseOrderDetail
        public decimal? UnitPrice { get; set; }              // từ PurchaseOrderDetail
        public decimal? TotalPrice { get; set; }             // từ PurchaseOrderDetail
    }
}
