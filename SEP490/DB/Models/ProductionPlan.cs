namespace SEP490.DB.Models;
public class ProductionPlan
{
    public int Id { get; set; }
    public DateTime PlanDate { get; set; }
    public string? OrderCode { get; set; }
    public int PurchaseOrderId { get; set; }
    public string? CustomerCode { get; set; }
    public int CustomerId { get; set; }
    public int Quantity { get; set; }
    public string? Status { get; set; }

    public PurchaseOrder PurchaseOrder { get; set; } = null!;
    public Customer Customer { get; set; } = null!;
}