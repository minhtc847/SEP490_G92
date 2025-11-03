namespace SEP490.DB.Models;
public class OrderDetail
{
    public int Id { get; set; }
    public string? OrderCode { get; set; }
    public int SaleOrderId { get; set; }
    public decimal? TotalAmount { get; set; }
    public SaleOrder SaleOrder { get; set; } = null!;
    public ICollection<OrderDetailProduct> OrderDetailProducts { get; set; }

}