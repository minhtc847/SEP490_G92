namespace SEP490.DB.Models;
public class Delivery
{
    public int Id { get; set; }
    public string? OrderCode { get; set; }
    public int SaleOrderId { get; set; }
    public string? CustomerName { get; set; }
    public DateTime? OrderDate { get; set; }
    public string? Address { get; set; }
    public decimal? TotalValue { get; set; }
    public int? QuantityToDeliver { get; set; }
    public int? QuantityDelivered { get; set; }
    public string? Status { get; set; }

    public SaleOrder SaleOrder { get; set; } = null!;
}