namespace SEP490.DB.Models;
public class OrderDetail
{
    public int Id { get; set; }
    public string? OrderCode { get; set; }
    public int PurchaseOrderId { get; set; }
    public int Quantity { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalAmount { get; set; }

    public PurchaseOrder PurchaseOrder { get; set; } = null!;
}