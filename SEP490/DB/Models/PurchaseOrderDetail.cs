using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEP490.DB.Models
{
    public class PurchaseOrderDetail
    {
        public int Id { get; set; }
        public int PurchaseOrderId { get; set; }
        public string? ProductName { get; set; }
        public string? Unit { get; set; }
        public int? Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TotalPrice { get; set; } 
        public PurchaseOrder? PurchaseOrder { get; set; }
        public int? ProductId { get; set; }
        public Product? Product { get; set; }
    }
}
