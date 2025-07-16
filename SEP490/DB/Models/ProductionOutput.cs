namespace SEP490.DB.Models
{
    public class ProductionOutput
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? UOM { get; set; }
        public decimal? Amount { get; set; }
        public int? Done { get; set; } = 0;
        public int? Broken { get; set; }
        public string? BrokenDescription { get; set; } 
        public string? Status { get; set; } // Trạng thái của sản phẩm: "Đã hoàn thành", "Đang sản xuất", "Bị hỏng", v.v.
        public int? ProductionOrderId { get; set; }
        public int? OutputFor { get; set; } // ID của ProductionPlanDetail mà output này phục vụ
        public ProductionOrder ProductionOrder { get; set; } = null!;
        public Product Product { get; set; } = null!;
    }
}
