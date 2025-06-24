namespace SEP490.Modules.Production_plans.DTO
{
    public class CreateProductionPlanInputDTO
    {
        public int SaleOrderId { get; set; }
        public int CustomerId { get; set; }
        //public string CustomerName { get; set; } = string.Empty;
        public DateTime PlanDate { get; set; }
        public string? OrderCode { get; set; } 
        public string Status { get; set; } = "Chưa xử lý";
        public List<CreateProductionPlanDetailInputDTO> Details { get; set; } = new();
    }

    public class CreateProductionPlanDetailInputDTO
    {
        public int ProductId { get; set; }
        public int Producing { get; set; }
        public int Done { get; set; }
    }
}
