using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEP490.DB.Models
{
    public class ProductionDefects
    {
        public int Id { get; set; }
        public int? ProductionOrderId { get; set; }
        public int? ProductId { get; set; }
        public int? Quantity { get; set; }
        public string? DefectType { get; set; }
        public string? DefectStage { get; set; }
        public string? Note { get; set; }
        public DateTime? ReportedAt { get; set; }
        public ProductionOrder? ProductionOrder { get; set; }
        public Product? Product { get; set; }
    }
}
