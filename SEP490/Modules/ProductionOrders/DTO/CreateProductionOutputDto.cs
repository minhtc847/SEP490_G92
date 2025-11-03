namespace SEP490.Modules.ProductionOrders.DTO
{
    public class CreateProductionOutputDto
    {
        public int ProductId { get; set; }
        public decimal Amount { get; set; }
        public int? ProductionOrderId { get; set; }
    }
} 