namespace SEP490.Modules.ProductionOrders.DTO
{
    public class ProductionOutputDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal? Amount { get; set; }
        public decimal? Done { get; set; }
        public decimal? Broken { get; set; }
        public string? ReasonBroken { get; set; }
        public int? ProductionOrderId { get; set; }
    }

    public class ReportBrokenOutputDto
    {
        public decimal Broken { get; set; }
        public string ReasonBroken { get; set; } = string.Empty;
    }

    public class ProductionDefectDto
    {
        public int Id { get; set; }
        public int? ProductionOrderId { get; set; }
        public int? ProductId { get; set; }
        public string? ProductName { get; set; }
        public int? Quantity { get; set; }
        public string? DefectType { get; set; }
        public string? DefectStage { get; set; }
        public string? Note { get; set; }
        public DateTime? ReportedAt { get; set; }
    }

    public class CreateDefectReportDto
    {
        public int ProductionOrderId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string DefectType { get; set; } = string.Empty;
        public string DefectStage { get; set; } = string.Empty;
        public string? Note { get; set; }
    }

    public class UpdateDefectReportDto
    {
        public int Quantity { get; set; }
        public string DefectType { get; set; } = string.Empty;
        public string DefectStage { get; set; } = string.Empty;
        public string? Note { get; set; }
    }
} 