namespace SEP490.Modules.Accountant.DTO
{
    public class CreateOutputDTO
    {
        public string ProductCode { get; set; }
        public string? ProductName { get; set; }
        public string? Uom { get; set; }
        public int Quantity { get; set; }

    }
}
