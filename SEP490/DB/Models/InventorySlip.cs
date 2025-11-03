namespace SEP490.DB.Models;

public class InventorySlip
{
    public int Id { get; set; }
    public string? SlipCode { get; set; }
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

    // Locked state: false = chưa cập nhật; true = đã cập nhật số lượng và khóa chỉnh sửa
    public bool IsFinalized { get; set; } = false;
    
    // Misa update state: false = chưa cập nhật lên Misa; true = đã cập nhật lên Misa
    public bool IsUpdateMisa { get; set; } = false;
}
