using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEP490.DB.Models
{
    public class FinishedGoods
    {
        public int Id { get; set; }
        public int? ProductionOrderId { get; set; }
        public int? ProductId { get; set; }
        public decimal? Quantity { get; set; }
        public string? QualityLevel { get; set; }
        public DateTime? CompletedAt { get; set; }
        public ProductionOrder? ProductionOrder { get; set; }
        public Product? Product { get; set; }
    }
}
