namespace SEP490.DB.Models
{
    public class Formular
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public double Ratio { get; set; }
        public string? Description { get; set; }
        public int? ProductId { get; set; }
        public Product? Product { get; set; }
    }
} 