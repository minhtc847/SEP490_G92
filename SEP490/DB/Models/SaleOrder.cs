namespace SEP490.DB.Models;
public class SaleOrder
{
    public int Id { get; set; }
    public string? OrderCode { get; set; }
    public DateTime OrderDate { get; set; }
    public int CustomerId { get; set; }
    public decimal? OrderValue { get; set; }
    public Status Status { get; set; } = Status.Pending;
    public DeliveryStatus DeliveryStatus { get; set; } = DeliveryStatus.NotDelivered;

    public bool IsUpdateMisa { get; set; }
    public string? Note { get; set; }
    public Customer Customer { get; set; } = null!;
    //Added for OrderDetail
    public ICollection<OrderDetail> OrderDetails { get; set; }
}

public enum Status
{
    Pending,
    Processing,
    Delivered,
    Cancelled
}

public enum DeliveryStatus
{
    NotDelivered,
    PartiallyDelivered,
    FullyDelivered
}