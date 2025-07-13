namespace SEP490.Modules.Accountant.DTO
{
    public class ProductionOrderDetailPageDTO
    {
        public int Id { get; set; }
        public string Description { get; set; } = "";
        public List<ProductionOrderProductDTO> Products { get; set; } = new();
    }

}
