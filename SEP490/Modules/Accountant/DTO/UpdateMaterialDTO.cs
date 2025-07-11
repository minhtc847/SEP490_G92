namespace SEP490.Modules.Accountant.DTO
{
    public class UpdateMaterialDTO
    {
        public string ProductCode { get; set; } // cost_object
        public string ProductName { get; set; } // cost_item
        public string Uom { get; set; }
        public decimal Amount { get; set; }
    }
}
