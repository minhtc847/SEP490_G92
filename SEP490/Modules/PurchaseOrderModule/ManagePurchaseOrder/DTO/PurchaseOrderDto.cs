namespace SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.DTO
{
    public class PurchaseOrderDto
    {
        public int Id { get; set; }
        public string? Code { get; set; }
        public DateTime? Date { get; set; }
        public string? Description { get; set; }
        public decimal? TotalValue { get; set; }
        public string? Status { get; set; }
        public string? SupplierName { get; set; }
        public string? CustomerName { get; set; }
        public string? EmployeeName { get; set; }
    }
}
