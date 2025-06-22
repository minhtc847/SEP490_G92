namespace SEP490.DB.Models;
public class ProductionOrder
{
    public int Id { get; set; }
    public string? ProductionOrderCode { get; set; }
    public DateTime OrderDate { get; set; }
    public string? Description { get; set; }
    public string? ProductionStatus { get; set; }
    public string? ProductionPlanCode { get; set; }
    public int ProductionPlanId { get; set; }

    public ProductionPlan ProductionPlan { get; set; } = null!;
}