namespace SEP490.Modules.GlueButylExport.DTO
{
    public class GlueButylExportResponseDTO
    {
        public int Id { get; set; }
        public List<ProductsDTO> Products { get; set; } = new List<ProductsDTO>();
        public List<GlueButylDto> GlueButyls { get; set; } = new List<GlueButylDto>();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? EmployeeName { get; set; }
        public string? Note { get; set; }
        public int ProductionOrderId { get; set; }
    }
}
