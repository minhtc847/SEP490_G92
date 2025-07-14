namespace SEP490.Modules.GlueButylExport.DTO
{
    public class CreateNewDTO
    {
        public int ProductionPlanId { get; set; }
        public int EmployeeId { get; set; }
        public string? Note { get; set; }
        public List<ProductsDTO> Products { get; set; } = new List<ProductsDTO>();
        public List<GlueButylDto> GlueButyls { get; set; } = new List<GlueButylDto>();
    }
}
