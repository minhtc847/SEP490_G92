namespace SEP490.Modules.ZaloOrderModule.DTO
{
    public class ZaloOrderDTO
    {
        public int Id { get; set; }
        public string? OrderCode { get; set; }
        public string? ZaloUserId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerAddress { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Note { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<ZaloOrderDetailDTO> ZaloOrderDetails { get; set; } = new List<ZaloOrderDetailDTO>();
    }

    public class ZaloOrderDetailDTO
    {
        public int Id { get; set; }
        public int ZaloOrderId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string? Height { get; set; }
        public string? Width { get; set; }
        public string? Thickness { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateZaloOrderDTO
    {
        public string? OrderCode { get; set; }
        public string? ZaloUserId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerAddress { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "Pending";
        public string? Note { get; set; }
        public List<CreateZaloOrderDetailDTO> ZaloOrderDetails { get; set; } = new List<CreateZaloOrderDetailDTO>();
    }

    public class CreateZaloOrderDetailDTO
    {
        public string ProductName { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string? Height { get; set; }
        public string? Width { get; set; }
        public string? Thickness { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class UpdateZaloOrderDTO
    {
        public string? OrderCode { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerAddress { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Note { get; set; }
        public List<UpdateZaloOrderDetailDTO> ZaloOrderDetails { get; set; } = new List<UpdateZaloOrderDetailDTO>();
    }

    public class UpdateZaloOrderDetailDTO
    {
        public int Id { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductCode { get; set; } = string.Empty;
        public string? Height { get; set; }
        public string? Width { get; set; }
        public string? Thickness { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
