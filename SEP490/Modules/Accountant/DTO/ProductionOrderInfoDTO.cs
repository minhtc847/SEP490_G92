namespace SEP490.Modules.Accountant.DTO
{
    public class ProductionOrderInfoDTO
    {
        public int Id { get; set; }
        public string ProductionOrderCode { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}