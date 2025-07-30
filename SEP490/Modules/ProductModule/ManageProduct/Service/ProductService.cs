using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductModule.ManageProduct.DTO;

namespace SEP490.Modules.ProductModule.ManageProduct.Service
{
    public class ProductService : BaseService, IProductService
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
                    GlassStructureProductName = p.GlassStructure.ProductName
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
                GlassStructureId = dto.GlassStructureId
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

        public bool UpdateProduct(int id, UpdateProductProductDto dto)
        {
            var product = _context.Products.FirstOrDefault(p => p.Id == id);
            if (product == null) return false;

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

            if (dto.GlassStructureId.HasValue)
            {
                product.GlassStructureId = dto.GlassStructureId.Value;
            }
            else
            {
                product.GlassStructureId = null;
            }

            _context.SaveChanges();
            return true;
        }



    }
}
