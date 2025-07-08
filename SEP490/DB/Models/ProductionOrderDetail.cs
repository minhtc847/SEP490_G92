namespace SEP490.DB.Models
{
    public class ProductionOrderDetail
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string TrangThai { get; set; } = string.Empty;
        public string TrangThaiXuatKeo { get; set; }
        public string TrangThaiCatKinh { get; set; }
        public Product? Product { get; set; }
        public ProductionOrder? ProductionOrder { get; set; }
        public int ProductionOrderId { get; set; }
    }
}
