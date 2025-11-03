namespace SEP490.DB.Models;
public class Product
{
    public int Id { get; set; }
    public string? ProductCode { get; set; }
    public string? ProductName { get; set; }
    public string? ProductType { get; set; }
    public string? UOM { get; set; }
    public string? Height { get; set; }
    public string? Width { get; set; }
    public decimal? Thickness { get; set; }
    public decimal? Weight { get; set; }
    public double quantity { get; set; } = 0; // Assuming this is the quantity of the product
    public decimal? UnitPrice { get; set; }
    public int? GlassStructureId { get; set; }
    public GlassStructure? GlassStructure { get; set; }
    public int? isupdatemisa { get; set; } = 0;
}