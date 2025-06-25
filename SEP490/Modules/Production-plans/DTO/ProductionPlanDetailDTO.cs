namespace SEP490.Modules.Production_plans.DTO
{
    public class ProductionPlanDetailDTO
    {
        public int Id { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public int? Quantity { get; set; }
        public int? InProgressQuantity { get; set; }
        public int? Completed { get; set; }
    }

    public class UpdateProductionPlanDetailsByProductDTO
    {
        public int ProductionPlanId { get; set; }
        public List<UpdateDetailByProductItemDTO> Details { get; set; } = new();
    }

    public class UpdateDetailByProductItemDTO
    {
        public int ProductId { get; set; }
        public int Producing { get; set; }
        public int Done { get; set; }
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
    }

}
