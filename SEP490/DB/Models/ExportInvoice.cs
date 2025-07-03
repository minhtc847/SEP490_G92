namespace SEP490.DB.Models
{
    public class ExportInvoice
    {
        public int Id { get; set; }
        public int? EmployeeId { get; set; }
        public string? EmployeeName { get; set; }
        public string? ExportDate { get; set; }
        public string? Note { get; set; }
        public int? Status { get; set; } // 0: Chua xac nhan, 1: Da xac nhan
        public int? TotalAmount { get; set; } // Tong so luong xuat
        public int ProductionOrderId { get; set; }
        public ProductionOrder ProductionOrder { get; set; } = null!;
    }
}
