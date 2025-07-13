using SEP490.DB.Models;

namespace SEP490.Modules.Accountant.DTO
{
    public class ProductionOrderProductDTO
    {
        public int OutputId { get; set; }
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string Uom { get; set; }
        public decimal Quantity { get; set; }
    }
}