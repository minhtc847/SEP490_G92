using SEP490.DB.Models;

namespace SEP490.Modules.Delivery.DTO
{
    public class CreateDeliveryDetailDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string? Note { get; set; }
    }

    public class CreateDeliveryDto
    {
        public int SalesOrderId { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public DateTime? ExportDate { get; set; }
        public DeliveryStatus Status { get; set; } = DeliveryStatus.Delivering;
        public string? Note { get; set; }
        public List<CreateDeliveryDetailDto> DeliveryDetails { get; set; } = new();
    }

    public class DeliveryValidationResult
    {
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public List<DeliveryValidationItem> ValidationItems { get; set; } = new();
    }

    public class DeliveryValidationItem
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int RequestedQuantity { get; set; }
        public int AvailableQuantity { get; set; }
        public bool IsValid => RequestedQuantity <= AvailableQuantity;
    }

    public class UpdateDeliveryStatusDto
    {
        public int Status { get; set; }
    }

    public class DeliveryDetailDto
    {
        public int Id { get; set; }
        public int SalesOrderId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public DateTime? DeliveryDate { get; set; }
        public DateTime? ExportDate { get; set; }
        public DeliveryStatus Status { get; set; }
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public List<DeliveryDetailItemDto> DeliveryDetails { get; set; } = new();
    }

    public class DeliveryDetailItemDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Amount { get; set; }
        public string? Note { get; set; }
    }

    public class UpdateDeliveryDto
    {
        public DateTime? DeliveryDate { get; set; }
        public DateTime? ExportDate { get; set; }
        public DeliveryStatus Status { get; set; }
        public string? Note { get; set; }
        public List<UpdateDeliveryDetailDto> DeliveryDetails { get; set; } = new();
    }

    public class UpdateDeliveryDetailDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string? Note { get; set; }
    }
} 