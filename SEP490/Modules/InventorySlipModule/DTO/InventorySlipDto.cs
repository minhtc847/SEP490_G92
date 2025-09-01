namespace SEP490.Modules.InventorySlipModule.DTO
{
    public class InventorySlipDto
    {
        public int Id { get; set; }
        public string? SlipCode { get; set; }
        public string? Description { get; set; }
        
        public int ProductionOrderId { get; set; }
        public string? ProductionOrderCode { get; set; }
        public string? ProductionOrderType { get; set; }
        
        public int CreatedBy { get; set; }
        public string? CreatedByEmployeeName { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsFinalized { get; set; }
        public bool IsUpdateMisa { get; set; }
        
        public List<InventorySlipDetailDto> Details { get; set; } = new List<InventorySlipDetailDto>();
    }

    public class InventorySlipDetailDto
    {
        public int Id { get; set; }
        public int? ProductId { get; set; } // Nullable để hỗ trợ thành phẩm mục tiêu
        public string? ProductCode { get; set; }
        public string? ProductName { get; set; }
        public string? ProductType { get; set; }
        public string? UOM { get; set; }
        public decimal Quantity { get; set; }
        public string? Note { get; set; }
        public int SortOrder { get; set; }
        public int? ProductionOutputId { get; set; }
        
        // Thông tin sản phẩm mục tiêu (cho phiếu xuất vật liệu)
        public string? TargetProductName { get; set; }
        public string? TargetProductCode { get; set; }
        
        // For mapping relationships (cut glass slips)
        public List<MaterialOutputMappingDto> OutputMappings { get; set; } = new List<MaterialOutputMappingDto>();
    }

    public class MaterialOutputMappingDto
    {
        public int Id { get; set; }
        public int OutputDetailId { get; set; }
        public string? OutputProductName { get; set; }
        public string? OutputProductCode { get; set; }
        public string? Note { get; set; }
    }

    public class CreateInventorySlipDto
    {
        public int ProductionOrderId { get; set; }
        public string? Description { get; set; }
        public List<CreateInventorySlipDetailDto> Details { get; set; } = new List<CreateInventorySlipDetailDto>();
        public List<CreateMaterialOutputMappingDto>? Mappings { get; set; }
        
        // Thêm trường để lưu số lượng sản phẩm mục tiêu cho phiếu xuất vật liệu
        public List<ProductionOutputTargetDto> ProductionOutputTargets { get; set; } = new List<ProductionOutputTargetDto>();
    }

    public class ProductionOutputTargetDto
    {
        public int ProductionOutputId { get; set; }
        public decimal TargetQuantity { get; set; }
    }

    public class CreateInventorySlipDetailDto
    {
        public int? ProductId { get; set; } // Nullable để hỗ trợ thành phẩm mục tiêu
        public decimal Quantity { get; set; }
        public string? Note { get; set; }
        public int SortOrder { get; set; }
        public int? ProductionOutputId { get; set; }
    }

    public class CreateMaterialOutputMappingDto
    {
        public int InputDetailId { get; set; }
        public int OutputDetailId { get; set; }
        public string? Note { get; set; }
    }

    public class ProductionOrderInfoDto
    {
        public int Id { get; set; }
        public string? ProductionOrderCode { get; set; }
        public string? Type { get; set; }
        public string? Description { get; set; }
        public List<ProductionOutputDto> ProductionOutputs { get; set; } = new List<ProductionOutputDto>();
        public List<ProductInfoDto> AvailableProducts { get; set; } = new List<ProductInfoDto>();
        
        // Separate lists for cut glass slips
        public List<ProductInfoDto> RawMaterials { get; set; } = new List<ProductInfoDto>();
        public List<ProductInfoDto> SemiFinishedProducts { get; set; } = new List<ProductInfoDto>();
        public List<ProductInfoDto> GlassProducts { get; set; } = new List<ProductInfoDto>();
    }

    public class ProductionOutputDto
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public string? UOM { get; set; }
        public decimal? Amount { get; set; }
        public decimal? Finished { get; set; }
        public decimal? Defected { get; set; }
    }

    public class ProductInfoDto
    {
        public int Id { get; set; }
        public string? ProductCode { get; set; }
        public string? ProductName { get; set; }
        public string? ProductType { get; set; }
        public string? UOM { get; set; }
        public string? Height { get; set; }
        public string? Width { get; set; }
        public decimal? Thickness { get; set; }
        public decimal? Weight { get; set; }
        public double Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
    }

    public class CreateInventoryProductDto
    {
        public string ProductCode { get; set; } = string.Empty;
        public string ProductName { get; set; } = string.Empty;
        public string ProductType { get; set; } = string.Empty;
        public string? UOM { get; set; }
        public string? Height { get; set; }
        public string? Width { get; set; }
        public decimal? Thickness { get; set; }
        public decimal? Weight { get; set; }
        public decimal? UnitPrice { get; set; }
    }

    // DTOs for pagination
    public class PaginatedProductsDto
    {
        public List<ProductInfoDto> Products { get; set; } = new List<ProductInfoDto>();
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
        public bool HasPreviousPage { get; set; }
        public bool HasNextPage { get; set; }
    }

    public class ProductSearchRequestDto
    {
        public int ProductionOrderId { get; set; }
        public string? ProductType { get; set; } // "NVL", "Bán thành phẩm", "Kính dư"
        public string? SearchTerm { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string? SortBy { get; set; } // "ProductName", "ProductCode", "CreatedAt"
        public bool SortDescending { get; set; } = false;
    }
}
