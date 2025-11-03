using System.Collections.Generic;

namespace SEP490.Modules.InventorySlipModule.DTO
{
    public class ProductClassificationDto
    {
        public int Index { get; set; }
        public int ProductId { get; set; }
        public string ProductType { get; set; }
        public int? ProductionOutputId { get; set; }
    }

    public class MappingInfoDto
    {
        public List<CreateMaterialOutputMappingDto> TempMappings { get; set; }
        public List<ProductClassificationDto> ProductClassifications { get; set; }
    }
}
