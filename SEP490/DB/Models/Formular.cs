namespace SEP490.DB.Models
{
    public class Formular
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string ChemicalName { get; set; } = string.Empty;
        public double Ratio { get; set; }
        public string? Description { get; set; }
        public int? GlassStructureId { get; set; }
        public GlassStructure? GlassStructure { get; set; }
    }
} 