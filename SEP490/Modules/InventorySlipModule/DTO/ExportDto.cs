namespace SEP490.Modules.InventorySlipModule.DTO
{
    public class ExportDto
    {
        public string? EmployeeName { get; set; }
        public List<ImportProductsDto> ProductsImport { get; set; } = new List<ImportProductsDto>();
        public List<ExportProductsDto> ProductsExport { get; set; } = new List<ExportProductsDto>();
    }

    public class ExportProductsDto
    {
        public string? ProductName { get; set; }
        public string? ProductQuantity { get; set; }
        public string? Price { get; set; }
    }

    public class ImportProductsDto
    {
        public string? ProductName { get; set; }
        public string? ProductQuantity { get; set; }
        public string? Price { get; set; }
    }
}


