namespace SEP490.Modules.Accountant.DTO
{
    public class ProductWithMaterialsDTO
    {
        public ProductionOrderProductDTO Product { get; set; } // giữ nguyên
        public List<MaterialAccountantDTO> Materials { get; set; } = new();
    }

    public class MaterialAccountantDTO
    {
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string Uom { get; set; }
        public decimal QuantityPer { get; set; }
        public decimal TotalQuantity { get; set; }
    }

}