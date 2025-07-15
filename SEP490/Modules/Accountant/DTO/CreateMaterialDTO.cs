namespace SEP490.Modules.Accountant.DTO
{
    public class CreateMaterialDTO
    {
        public string? ProductName { get; set; }
        public string? Uom { get; set; }
        public decimal TotalQuantity { get; set; }
    }
}
