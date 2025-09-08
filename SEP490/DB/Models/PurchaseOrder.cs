using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEP490.DB.Models
{
    public class PurchaseOrder
    {
        public int Id { get; set; }
        public DateTime? Date { get; set; }
        public string? Code { get; set; }
        public int? SupplierId { get; set; }
        public string? Description { get; set; }
        public decimal? TotalValue { get; set; }
        public PurchaseStatus? Status { get; set; } = PurchaseStatus.Pending;
        public int? EmployeeId { get; set; }
        public int? CustomerId { get; set; }
        public bool IsUpdateMisa { get; set; } = false;
        public Customer? Customer { get; set; }
        public Customer? Supplier { get; set; }
        public Employee? Employee { get; set; }
        public ICollection<PurchaseOrderDetail>? PurchaseOrderDetails { get; set; } = new List<PurchaseOrderDetail>();
    }

    public enum PurchaseStatus
    {
        Pending,
        Ordered,
        Imported,
        Cancelled
    }
}
