using System.Collections.Generic;

namespace SEP490.Modules.Delivery.DTO
{
    public class DeliveryOrderDto
    {
        public int Id { get; set; }
        public string OrderDate { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string? Note { get; set; }
        public List<DeliveryProductDto> Products { get; set; } = new();
    }

    public class DeliveryProductDto
    {
        public int Id { get; set; } // ProductionPlanDetailId
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public int Done { get; set; } // số lượng đã xong
        public decimal TotalAmount { get; set; }
        public int Delivered { get; set; }
        public string LastDeliveryDate { get; set; } = string.Empty;
        public string? Note { get; set; }
    }
} 