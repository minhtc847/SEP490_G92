namespace SEP490.DB.Models;
public class ZaloOrder
{
    public int Id { get; set; }
    public string? OrderCode { get; set; }
    public string? ZaloUserId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerAddress { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal TotalAmount { get; set; }
    public ZaloOrderStatus Status { get; set; } = ZaloOrderStatus.Pending;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation property
    public ICollection<ZaloOrderDetail> ZaloOrderDetails { get; set; } = new List<ZaloOrderDetail>();
}

public enum ZaloOrderStatus
{
    Pending,
    Confirmed,
    Processing,
    Completed,
    Cancelled
}
