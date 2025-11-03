namespace SEP490.DB.Models
{
    public class ChemicalExport
    {
        public int Id { get; set; }
        public int? ProductId { get; set; }
        public decimal Quantity { get; set; }
        public string? UOM { get; set; }
        public string? Note { get; set; } = string.Empty;
        public int? ProductionOrderId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public ProductionOrder ProductionOrder { get; set; } = null!;
        public Product Product { get; set; } = null!;
        public ICollection<ChemicalExportDetail> ChemicalExportDetails { get; set; } = new List<ChemicalExportDetail>();
    }
}
