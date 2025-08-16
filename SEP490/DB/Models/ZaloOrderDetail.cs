namespace SEP490.DB.Models;
public class ZaloOrderDetail
{
    public int Id { get; set; }
    public int ZaloOrderId { get; set; }
    public string ProductName { get; set; } = string.Empty; // Product code + type + size
    public string ProductCode { get; set; } = string.Empty;
    public string? Height { get; set; }
    public string? Width { get; set; }
    public string? Thickness { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    // Navigation property
    public ZaloOrder ZaloOrder { get; set; } = null!;
}
