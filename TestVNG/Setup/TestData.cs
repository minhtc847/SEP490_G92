using SEP490.DB.Models;
using System.Collections.Generic;

namespace TestVNG.Setup
{
    internal static class TestData
    {
        public static List<GlassStructure> GetSampleGlassStructures()
        {
            return new List<GlassStructure>
            {
                new GlassStructure
                {
                    Id = 1,
                    ProductName = "Glass A",
                    ProductCode = "GLA001",
                    Category = "Double",
                    EdgeType = "Polished",
                    AdhesiveType = "UV",
                    GlassLayers = 2,
                    AdhesiveLayers = 1,
                    AdhesiveThickness = 0.5m,
                    UnitPrice = 200000,
                    Composition = "A+B"
                }
            };
        }

        public static List<Product> GetSampleProducts()
        {
            return new List<Product>
            {
                new Product
                {
                    Id = 1,
                    ProductCode = "PROD001",
                    ProductName = "Product 1",
                    ProductType = "Thành phẩm",
                    UOM = "Tấm",
                    Height = "200",
                    Width = "100",
                    Thickness = 5,
                    Weight = 10,
                    quantity = 5,
                    UnitPrice = 100000,
                    GlassStructureId = null // Không có cấu trúc kính
                },
                new Product
                {
                    Id = 2,
                    ProductCode = "PROD002",
                    ProductName = "Product 2",
                    ProductType = "Thành phẩm",
                    UOM = "Tấm",
                    Height = "300",
                    Width = "150",
                    Thickness = 8,
                    Weight = 15,
                    quantity = 3,
                    UnitPrice = 160000,
                    GlassStructureId = 1 // Gắn GlassStructure
                }
            };
        }
    }
}
