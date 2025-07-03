namespace SEP490.Modules.GlassStructureModule.ManageGlassStructure.DTO
{
    public class UpdateGlassStructureDto
    {
        public string? ProductCode { get; set; }
        public string? ProductName { get; set; }
        public string? Category { get; set; }
        public string? EdgeType { get; set; }
        public string? AdhesiveType { get; set; }
        public int? GlassLayers { get; set; }
        public int? AdhesiveLayers { get; set; }
        public decimal? AdhesiveThickness { get; set; }
        public int? UnitPrice { get; set; }
        public string? Composition { get; set; }
    }
}
