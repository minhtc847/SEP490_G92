namespace SEP490.DB.Models;
public class DeliveryDetail
{
    public int Id { get; set; }
    public int DeliveryId { get; set; }
    public DateTime DeliveryDate { get; set; }
    public string? ProductCode { get; set; }
    public int ProductId { get; set; }
    public int? Quantity { get; set; }
    public decimal? Height { get; set; }
    public decimal? Width { get; set; }
    public decimal? Thickness { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalAmount { get; set; }

    public Delivery Delivery { get; set; } = null!;
    public Product Product { get; set; } = null!;
}