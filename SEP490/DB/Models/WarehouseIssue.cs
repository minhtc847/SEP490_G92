namespace SEP490.DB.Models;
public class WarehouseIssue
{
    public int Id { get; set; }
    public string? DocumentCode { get; set; }
    public DateTime AccountingDate { get; set; }
    public DateTime? DocumentDate { get; set; }
    public string? Description { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? Receiver { get; set; }
    public string? IssueReason { get; set; }
    public string? ProductionOrderCode { get; set; }
    public int? ProductionOrderId { get; set; }

    public ProductionOrder? ProductionOrder { get; set; }
}