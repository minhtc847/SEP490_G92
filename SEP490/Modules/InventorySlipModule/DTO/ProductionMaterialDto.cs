namespace SEP490.Modules.InventorySlipModule.DTO
{
    public class ProductionMaterialDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string UOM { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public int ProductionOutputId { get; set; }
    }
}
