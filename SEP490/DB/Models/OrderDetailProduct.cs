namespace SEP490.DB.Models;
public class OrderDetailProduct
{
    public int OrderDetailId { get; set; }
    public int ProductId { get; set; }
    public OrderDetail OrderDetail { get; set; } = null!;
    public Product Product { get; set; } = null!;
}