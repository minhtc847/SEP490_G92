using SEP490.Modules.GlueButylExport.DTO;
using System.Text.Json.Serialization;

namespace SEP490.DB.Models
{
    public class GlueButylExportInvoice
    {
        public int Id { get; set; }
        public List<ProductsDTO> Products { get; set; }
        public List<GlueButylDto> GlueButyls { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public int? EmployeeId { get; set; }
        public Employee? Employee { get; set; }
        public string? Note { get; set; }
        public int? ProductionOrderId { get; set; }
        public ProductionOrder? ProductionOrder { get; set; }
    }
}
