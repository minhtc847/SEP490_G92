namespace SEP490.DB.Models;
public class InventoryTransaction
{
    public int Id { get; set; }
    public string? ProductCode { get; set; }
    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? Warehouse { get; set; }
    public string? UOM { get; set; }
    public int? Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? ProductionOrderCode { get; set; }
    public int? ProductionOrderId { get; set; }
    public string? CostObject { get; set; }
    public string? CodeItem { get; set; }
    public int? WarehouseReceiptId { get; set; }
    public int? WarehouseIssueId { get; set; }

    public Product Product { get; set; } = null!;
    public ProductionOrder? ProductionOrder { get; set; }
    public WarehouseReceipt? WarehouseReceipt { get; set; }
    public WarehouseIssue? WarehouseIssue { get; set; }
}