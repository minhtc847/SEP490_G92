namespace SEP490.Selenium.ImportExportInvoice.DTO
{
    public class ExportDTO
    {
        public string EmployeeName { get; set; }

        public List<ImportProductsDTO> ProductsImport { get; set; }
        public List<ExportProductsDTO> ProductsExport { get; set; }
    }

    public class ExportProductsDTO
    {
        public string ProductName { get; set; }
        public string ProductQuantity { get; set; }
        public string Price { get; set; }
    }

    public class ImportProductsDTO
    {
        public string ProductName { get; set; }
        public string ProductQuantity { get; set; }
        public string Price { get; set; }
    }
}
