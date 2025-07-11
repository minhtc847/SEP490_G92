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
        public string? Status { get; set; } // Can be replaced with enum or separate status table
        public int? EmployeeId { get; set; }
        public int? CustomerId { get; set; }
        public Customer? Customer { get; set; }
        public Customer? Supplier { get; set; }
        public Employee? Employee { get; set; }
        public ICollection<PurchaseOrderDetail>? PurchaseOrderDetails { get; set; } = new List<PurchaseOrderDetail>();
    }
}
