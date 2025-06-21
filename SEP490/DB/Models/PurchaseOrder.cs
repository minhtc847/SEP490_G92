namespace SEP490.DB.Models;
public class PurchaseOrder
{
    public int Id { get; set; }
    public string? OrderCode { get; set; }
    public DateTime OrderDate { get; set; }
    public string? CustomerCode { get; set; }
    public int CustomerId { get; set; }
    public decimal? OrderValue { get; set; }
    public string? Status { get; set; }
    public string? DeliveryStatus { get; set; }

    public Customer Customer { get; set; } = null!;
}