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
    public PartnerType PartnerType { get; set; } // Enum
    public ICollection<SaleOrder> SaleOrders { get; set; } = new List<SaleOrder>();
    public ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
}

public enum PartnerType
{
    Customer,
    Vendor
}