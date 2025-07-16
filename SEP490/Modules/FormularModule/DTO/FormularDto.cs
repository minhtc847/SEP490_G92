namespace SEP490.Modules.FormularModule.DTO
{
    public class FormularDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string ChemicalName { get; set; } = string.Empty;
        public double Ratio { get; set; }
        public string? Description { get; set; }
        public int? ProductId { get; set; }

    }

    public class FormularGroupDto
    {
        public string Type { get; set; } = string.Empty;
        public List<FormularDto> Formulars { get; set; } = new List<FormularDto>();
    }
} 