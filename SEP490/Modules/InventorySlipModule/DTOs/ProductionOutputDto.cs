namespace SEP490.Modules.InventorySlipModule.DTOs
{
    public class ProductionOutputDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? Uom { get; set; }
        public decimal Amount { get; set; }
        public decimal Finished { get; set; }
        public decimal Defected { get; set; }
    }
}
