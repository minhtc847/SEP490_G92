namespace SEP490.Modules.ChemicalExportModule.DTO
{
    public class ChemicalExportDto
    {
        public int Id { get; set; }
        public int? ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal Quantity { get; set; }
        public string? UOM { get; set; }
        public string? Note { get; set; }
        public int? ProductionOrderId { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<ChemicalExportDetailDto> Details { get; set; } = new List<ChemicalExportDetailDto>();
    }

    public class ChemicalExportDetailDto
    {
        public int Id { get; set; }
        public int? ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal Quantity { get; set; }
        public string? UOM { get; set; }
        public string? Note { get; set; }
        public int? ChemicalExportId { get; set; }
    }

    public class CreateChemicalExportDto
    {
        public int ProductionOrderId { get; set; }
        public List<ChemicalExportProductDto> Products { get; set; } = new List<ChemicalExportProductDto>();
        public string? Note { get; set; }
    }

    public class ChemicalExportProductDto
    {
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal Quantity { get; set; }
        public string? UOM { get; set; }
        public List<ChemicalExportMaterialDto> Materials { get; set; } = new List<ChemicalExportMaterialDto>();
    }

    public class ChemicalExportMaterialDto
    {
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public decimal Quantity { get; set; }
        public string? UOM { get; set; }
    }

    public class ProductionOrderProductsDto
    {
        public int ProductionOrderId { get; set; }
        public List<ProductionOutputDto> Outputs { get; set; } = new List<ProductionOutputDto>();
        public List<ProductionMaterialDto> Materials { get; set; } = new List<ProductionMaterialDto>();
    }

    public class ProductionOutputDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? UOM { get; set; }
        public decimal? Amount { get; set; }
        public int? Finished { get; set; }
        public int? Defected { get; set; }
    }

    public class ProductionMaterialDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? UOM { get; set; }
        public decimal? Amount { get; set; }
        public int ProductionOutputId { get; set; }
    }
} 