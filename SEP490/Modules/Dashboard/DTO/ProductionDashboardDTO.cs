namespace SEP490.Modules.Dashboard.DTO
{
    public class ProductionDashboardOverviewDTO
    {
        public ProductionPlanOverviewDTO ProductionPlans { get; set; } = new();
        public ProductionOrderOverviewDTO ProductionOrders { get; set; } = new();
        public InventorySlipOverviewDTO InventorySlips { get; set; } = new();
        public MaterialStatusDTO Materials { get; set; } = new();
        public List<ProductionAlertDTO> Alerts { get; set; } = new();
    }

    public class ProductionPlanOverviewDTO
    {
        public int TotalPlans { get; set; }
        public int ActivePlans { get; set; }
        public int CompletedPlans { get; set; }
        public int PendingPlans { get; set; }
        public List<PlanStatusSummaryDTO> PlansByStatus { get; set; } = new();
        public List<ProductionPlanDTO> RecentPlans { get; set; } = new();
    }

    public class ProductionOrderOverviewDTO
    {
        public int TotalOrders { get; set; }
        public int ActiveOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int PausedOrders { get; set; }
        public List<OrderStatusSummaryDTO> OrdersByStatus { get; set; } = new();
        public List<OrderTypeSummaryDTO> OrdersByType { get; set; } = new();
        public ProductionEfficiencyDTO Efficiency { get; set; } = new();
    }

    public class InventorySlipOverviewDTO
    {
        public int TotalSlips { get; set; }
        public int FinalizedSlips { get; set; }
        public int PendingSlips { get; set; }
        public int MisaUpdatedSlips { get; set; }
        public List<SlipTypeSummaryDTO> SlipsByType { get; set; } = new();
        public List<InventorySlipDTO> RecentSlips { get; set; } = new();
    }

    public class MaterialStatusDTO
    {
        public int TotalMaterials { get; set; }
        public int AvailableMaterials { get; set; }
        public int LowStockMaterials { get; set; }
        public int OutOfStockMaterials { get; set; }
        public List<MaterialStatusSummaryDTO> MaterialsByStatus { get; set; } = new();
    }

    // Summary DTOs
    public class PlanStatusSummaryDTO
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class OrderStatusSummaryDTO
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class OrderTypeSummaryDTO
    {
        public string Type { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
    }

    public class SlipTypeSummaryDTO
    {
        public string Type { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class MaterialStatusSummaryDTO
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
        public double Percentage { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class ProductionEfficiencyDTO
    {
        public double AverageCompletionTime { get; set; }
        public double OnTimeDeliveryRate { get; set; }
        public double ResourceUtilization { get; set; }
    }

    public class ProductionAlertDTO
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsRead { get; set; }
    }

    // Data DTOs
    public class ProductionPlanDTO
    {
        public int Id { get; set; }
        public string PlanDate { get; set; } = string.Empty;
        public string OrderCode { get; set; } = string.Empty;
        public int OrderId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class InventorySlipDTO
    {
        public int Id { get; set; }
        public string SlipCode { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int ProductionOrderId { get; set; }
        public string ProductionOrderCode { get; set; } = string.Empty;
        public string ProductionOrderType { get; set; } = string.Empty;
        public string CreatedByEmployeeName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsFinalized { get; set; }
        public bool IsUpdateMisa { get; set; }
    }

    // Order Details DTOs
    public class OrderDetailDTO
    {
        public int Id { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalValue { get; set; }
        public string Status { get; set; } = string.Empty;
        public List<OrderProductDTO> Products { get; set; } = new List<OrderProductDTO>();
    }

    public class OrderProductDTO
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public int DeliveredQuantity { get; set; }
        public int RemainingQuantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string DeliveryStatus { get; set; } = string.Empty;
    }
}