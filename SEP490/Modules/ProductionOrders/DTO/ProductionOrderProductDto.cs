namespace SEP490.Modules.ProductionOrders.DTO
{
    public class ProductionOrderProductDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class ProductionOrderCreateRequest
    {
        public int ProductionPlanId { get; set; }
        public string? Description { get; set; }
        public List<ProductionOrderProductDto> Products { get; set; } = new();
    }
}
