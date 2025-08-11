namespace SEP490.Modules.Accountant.DTO
{
    public class CreateMaterialDTO
    {
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public int Uom { get; set; }
        public decimal TotalQuantity { get; set; }
    }
}
