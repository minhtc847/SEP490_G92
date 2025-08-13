namespace SEP490.DB.Models;

public class MaterialOutputMapping
{
    public int Id { get; set; }
    public int InputDetailId { get; set; }
    public int OutputDetailId { get; set; }

    public string? Note { get; set; }

    public InventorySlipDetail InputDetail { get; set; } = null!;
    public InventorySlipDetail OutputDetail { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}
