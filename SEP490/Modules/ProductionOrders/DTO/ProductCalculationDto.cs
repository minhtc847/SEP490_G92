namespace SEP490.Modules.ProductionOrders.DTO
{
    public class ProductCalculationDto
    {
        public decimal GlassArea { get; set; } // Diện tích kính (m^2)
        public decimal Perimeter { get; set; } // Chu vi (mm)
        public decimal AdhesiveArea { get; set; } // Diện tích keo (m^2)
        public decimal AdhesivePerLayer { get; set; } // Lượng keo / 1 lớp (kg)
        public decimal TotalAdhesive { get; set; } // Tổng lượng keo (kg)
        public decimal ButylLength { get; set; } // Chiều dài butyl (m)
        public decimal SubstanceA { get; set; } // Chất A (kg)
        public decimal KOH { get; set; } // KOH (kg)
        public decimal H2O { get; set; } // H2O (kg)
    }
} 