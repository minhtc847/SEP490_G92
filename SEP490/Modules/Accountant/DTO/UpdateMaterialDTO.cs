namespace SEP490.Modules.Accountant.DTO
{
    public class UpdateMaterialDTO
    {
        public string ProductName { get; set; } // cost_item
        public string Uom { get; set; }
        public decimal Amount { get; set; }
    }
}
