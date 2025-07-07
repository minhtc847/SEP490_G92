namespace SEP490.Modules.ProductionOrders.DTO
{
    public class ProductionOrdersByPlanDto
    {
        public int ProductionOrderId { get; set; }
        public DateTime OrderDate { get; set; }
        public string? Type { get; set; }
        public string? Description { get; set; }
        public bool StatusDaXuatKhoNVL { get; set; }
        public bool StatusDaNhapKhoTP { get; set; }
    }
}
