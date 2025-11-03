using SEP490.DB.Models;

namespace SEP490.Modules.InvoiceModule.DTO
{
    public class InvoiceDetailDto
    {
        public int Id { get; set; }
        public int InvoiceId { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal Total { get; set; }
        public string? Description { get; set; }
    }

    public class InvoiceWithDetailsDto : InvoiceDto
    {
        public List<InvoiceDetailDto> InvoiceDetails { get; set; } = new();
        public string? Note { get; set; }
    }
} 