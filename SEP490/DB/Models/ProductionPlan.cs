namespace SEP490.DB.Models;
public class ProductionPlan
{
    public int Id { get; set; }
    public DateTime PlanDate { get; set; }
    public int? SaleOrderId { get; set; }
    public string? CustomerCode { get; set; }
    public int? CustomerId { get; set; }
    public int? Quantity { get; set; }
    public string? Status { get; set; }

    public SaleOrder? SaleOrder { get; set; } = null!;
    public Customer? Customer { get; set; } = null!;
    public ICollection<ProductionPlanDetail> ProductionPlanDetails { get; set; } = new List<ProductionPlanDetail>();
}