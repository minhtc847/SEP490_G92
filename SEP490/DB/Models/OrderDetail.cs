namespace SEP490.DB.Models;
public class OrderDetail
{
    public int Id { get; set; }
    public string? OrderCode { get; set; }
    public int SaleOrderId { get; set; }
    //public int? Quantity { get; set; }
    //public decimal? UnitPrice { get; set; }
    public decimal? TotalAmount { get; set; }
    public SaleOrder SaleOrder { get; set; } = null!;
    //Added for OrderDetailProduct
    public ICollection<OrderDetailProduct> OrderDetailProducts { get; set; }

}