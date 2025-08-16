using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductModule.DTO;

namespace SEP490.Modules.ProductModule.Service
{
    public class ProductService : BaseScopedService, IProductService
    {
        private readonly SEP490DbContext _context;

        public ProductService(SEP490DbContext context)
        {
            _context = context;
        }

        public List<ProductDto> GetAllProducts()
        {
            return _context.Products
                .Include(p => p.GlassStructure)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    ProductCode = p.ProductCode,
                    ProductName = p.ProductName,
                    ProductType = p.ProductType,
                    UOM = p.UOM,
                    Height = p.Height,
                    Width = p.Width,
                    Thickness = p.Thickness,
                    Weight = p.Weight,
                    UnitPrice = p.UnitPrice,
                    GlassStructureId = p.GlassStructureId,
                    Quantity = p.quantity,
                    GlassStructureProductName = p.GlassStructure != null ? p.GlassStructure.ProductName : null,
                    isupdatemisa = p.isupdatemisa ? 1 : 0
                })
                .ToList();
        }

        public void CreateProduct(CreateProductProductDto dto)
        {
            var newProduct = new Product
            {
                ProductCode = dto.ProductCode,
                ProductName = dto.ProductName,
                ProductType = dto.ProductType,
                UOM = dto.UOM,
                Height = dto.Height,
                Width = dto.Width,
                Thickness = dto.Thickness,
                Weight = dto.Weight,
                UnitPrice = dto.UnitPrice,
                GlassStructureId = dto.GlassStructureId,
                isupdatemisa = dto.isupdatemisa == 1
            };

            _context.Products.Add(newProduct);
            _context.SaveChanges();
        }

        public bool DeleteProduct(int id)
        {
            var product = _context.Products.FirstOrDefault(p => p.Id == id);
            if (product == null) return false;

            var isUsedInOrders = _context.OrderDetailProducts.Any(odp => odp.ProductId == id);
            if (isUsedInOrders)
                throw new InvalidOperationException("Sản phẩm đang được sử dụng trong đơn hàng, không thể xoá!");

            _context.Products.Remove(product);
            _context.SaveChanges();
            return true;
        }

        public Product? GetProductById(int id)
        {
            return _context.Products
                .Include(p => p.GlassStructure)
                .FirstOrDefault(p => p.Id == id);
        }

        public ProductDetailDto? GetProductDetailById(int id)
        {
            var product = _context.Products
                .Include(p => p.GlassStructure)
                .FirstOrDefault(p => p.Id == id);

            if (product == null) return null;

            return new ProductDetailDto
            {
                Id = product.Id,
                ProductCode = product.ProductCode,
                ProductName = product.ProductName,
                ProductType = product.ProductType,
                UOM = product.UOM,
                Height = product.Height,
                Width = product.Width,
                Thickness = product.Thickness,
                Weight = product.Weight,
                UnitPrice = product.UnitPrice,
                GlassStructureId = product.GlassStructureId,
                GlassStructureProductName = product.GlassStructure?.ProductName,
                Quantity = product.quantity,
                isupdatemisa = product.isupdatemisa ? 1 : 0
            };
        }

            public bool UpdateProduct(int id, UpdateProductProductDto dto)
            {
                var product = _context.Products.FirstOrDefault(p => p.Id == id);
                if (product == null) return false;

                if (id <= 0)
                    throw new ArgumentException("Invalid Product Id");

                //if (dto.ProductName == null)
                //    throw new ArgumentException("ProductName is required");

                //if (dto.ProductCode == null)
                //    throw new ArgumentException("ProductCode is required");

                //if (dto.UnitPrice < 0)
                //    throw new ArgumentException("UnitPrice must be non-negative");

                if (dto.GlassStructureId.HasValue)
                {
                    var exists = _context.GlassStructures.Any(gs => gs.Id == dto.GlassStructureId.Value);
                    if (!exists)
                    {
                        throw new ArgumentException("Invalid GlassStructureId");
                    }
                }

                var isDuplicateName = _context.Products.Any(p => p.ProductName == dto.ProductName && p.Id != id);
                if (isDuplicateName)
                    throw new ArgumentException("Duplicate ProductName");


                product.ProductCode = dto.ProductCode;
                product.ProductName = dto.ProductName;
                product.ProductType = dto.ProductType;
                product.UOM = dto.UOM;
                product.Height = dto.Height;
                product.Width = dto.Width;
                product.Thickness = dto.Thickness;
                product.Weight = dto.Weight;
                product.UnitPrice = dto.UnitPrice;
                product.quantity = dto.Quantity;
                product.isupdatemisa = dto.isupdatemisa == 1;
                product.GlassStructureId = dto.GlassStructureId;

                _context.SaveChanges();
                return true;
            }
    }
}
