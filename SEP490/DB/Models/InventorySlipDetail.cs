namespace SEP490.DB.Models;

public class InventorySlipDetail
{
    public int Id { get; set; }
    
    // Foreign key references
    public int InventorySlipId { get; set; }
    public int? ProductId { get; set; } // Nullable để hỗ trợ thành phẩm mục tiêu
    public int? ProductionOutputId { get; set; }
    
    // Properties
    public decimal Quantity { get; set; }
    public string? Note { get; set; }
    public int SortOrder { get; set; } = 0;
    
    // Navigation properties
    public InventorySlip InventorySlip { get; set; } = null!;
    public Product? Product { get; set; } // Nullable vì ProductId có thể null
    public ProductionOutput? ProductionOutput { get; set; }
    
    // Navigation properties cho MaterialOutputMapping
    public ICollection<MaterialOutputMapping> InputMappings { get; set; } = new List<MaterialOutputMapping>();
    public ICollection<MaterialOutputMapping> OutputMappings { get; set; } = new List<MaterialOutputMapping>();
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}
