namespace SEP490.Modules.Production_plans.DTO
{
    public class ProductionPlanDetailViewDTO
    {
        // Customer info
        public string CustomerName { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Phone { get; set; }

        // Sale order info
        public string OrderCode { get; set; } = string.Empty; // "DH" + SaleOrder.Id
        public DateTime OrderDate { get; set; }
        public string? DeliveryStatus { get; set; }

        // Production plan info
        public DateTime PlanDate { get; set; }
        public string? Status { get; set; }
        public int? Quantity { get; set; }

        // Production plan detail info
        public int Done { get; set; }

    }
}
