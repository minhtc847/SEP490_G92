namespace SEP490.DB.Models;

public class InventorySlip
{
    public int Id { get; set; }
    public string? SlipCode { get; set; }
    public DateTime SlipDate { get; set; }
    public TransactionType TransactionType { get; set; }
    public string? Description { get; set; }
    
    // Foreign key references
    public int ProductionOrderId { get; set; }
    public int CreatedBy { get; set; }
    
    // Navigation properties
    public ProductionOrder ProductionOrder { get; set; } = null!;
    public Employee CreatedByEmployee { get; set; } = null!;
    public ICollection<InventorySlipDetail> Details { get; set; } = new List<InventorySlipDetail>();
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}

public enum TransactionType
{
    In,     // Nhập kho
    Out     // Xuất kho
}
