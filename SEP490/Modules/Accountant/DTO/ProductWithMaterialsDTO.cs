namespace SEP490.Modules.Accountant.DTO
{
    public class ProductWithMaterialsDTO
    {
        public ProductionOrderProductDTO Product { get; set; } 
        public List<MaterialAccountantDTO> Materials { get; set; } = new();
    }

    public class MaterialAccountantDTO
    {
        public int Id { get; set; }
        public string ProductName { get; set; }
        public int Uom { get; set; }
        public decimal QuantityPer { get; set; }
        public decimal TotalQuantity { get; set; }
    }

}