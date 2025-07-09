namespace SEP490.DB.Models;
public class Customer
{
    public int Id { get; set; }
    public string? CustomerCode { get; set; }
    public string? CustomerName { get; set; }
    public string? Address { get; set; }
    public decimal? Debt { get; set; }
    public string? TaxCode { get; set; }
    public string? ContactPerson { get; set; }
    public string? Phone { get; set; }
    public decimal? Discount { get; set; }
    public bool IsSupplier { get; set; }

    public string? ZaloId { get; set; }
    public string? ZaloName { get; set; }
    public string? TagName { get; set; }
    public ICollection<SaleOrder> SaleOrders { get; set; } = new List<SaleOrder>();
    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
}