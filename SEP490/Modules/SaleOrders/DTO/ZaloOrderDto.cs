namespace SEP490.Modules.SaleOrders.DTO
{
    public class ZaloOrderRequestDto
    {
        public string PhoneNumber { get; set; } = string.Empty;
        public List<ZaloOrderItemDto> Items { get; set; } = new List<ZaloOrderItemDto>();
    }

    public class ZaloOrderItemDto
    {
        public string ProductCode { get; set; } = string.Empty;
        public string Height { get; set; } = string.Empty;
        public string Width { get; set; } = string.Empty;
        public decimal Thickness { get; set; }
        public int Quantity { get; set; }
    }

    public class ZaloOrderResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public ZaloOrderDetailsDto? OrderDetails { get; set; }
    }

    public class ZaloOrderDetailsDto
    {
        public int OrderId { get; set; }
        public string OrderCode { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public List<ZaloOrderItemDetailsDto> Items { get; set; } = new List<ZaloOrderItemDetailsDto>();
    }

    public class ZaloOrderItemDetailsDto
    {
        public string ProductName { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string Dimensions { get; set; } = string.Empty; // Height x Width x Thickness
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}