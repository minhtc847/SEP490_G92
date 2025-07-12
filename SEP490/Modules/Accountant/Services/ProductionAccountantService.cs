using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Accountant.DTO;
using SEP490.Modules.ProductionOrders;
using SEP490.Modules.ProductionOrders.Services;

namespace SEP490.Modules.Accountant.Services
{
    public class ProductionAccountantService : BaseService, IProductionAccountantService
    {
        private readonly SEP490DbContext _context;
        public ProductionAccountantService(SEP490DbContext context)
        {
            _context = context;
        }

        public List<AccountantDTO> GetAll()
        {
            return _context.ProductionOrders
                .Include(po => po.ProductionPlan)
                    .ThenInclude(pp => pp.Customer)
                .Include(po => po.ProductionPlan)
                    .ThenInclude(pp => pp.SaleOrder)
                .Select(po => new AccountantDTO
                {
                    ProductionOrderId = po.Id,
                    ProductionOrderCode = po.ProductionOrderCode,
                    OrderCode = po.ProductionPlan.SaleOrder.OrderCode,
                    CustomerName = po.ProductionPlan.Customer.CustomerName,
                    TotalAmount = _context.ProductionOutputs
                        .Where(poOut => poOut.ProductionOrderId == po.Id)
                        .Sum(poOut => (int?)poOut.Amount ?? 0),
                    Status = po.ProductionStatus
                })
                .ToList();
        }

        public List<ProductionOrderProductDTO> GetProductsByProductionOrderId(int productionOrderId)
        {
            var products = _context.ProductionOutputs
                .Where(po => po.ProductionOrderId == productionOrderId)
                .Include(po => po.Product)
                .Select(po => new ProductionOrderProductDTO
                {
                    ProductCode = po.Product.ProductCode,
                    ProductName = po.ProductName,
                    Uom = po.UOM,
                    Quantity = po.Amount ?? 0
                })
                .ToList();

            return products;
        }


        //public async Task<List<ProductWithMaterialsDTO>> GetProductAndMaterialByProductionOrderId(int productionOrderId)
        //{
        //    var outputs = await _context.ProductionOutputs
        //        .Where(po => po.ProductionOrderId == productionOrderId)
        //        .Include(po => po.Product)
        //        .ToListAsync();

        //    var result = outputs.Select(d => new ProductWithMaterialsDTO
        //    {
        //        Product = new ProductionOrderProductDTO
        //        {
        //            ProductCode = d.Product.ProductCode,
        //            ProductName = d.Product.ProductName,
        //            Uom = d.Product.UOM,
        //            Quantity = d.Amount ?? 0
        //        },
        //        Materials = _context.ProductionMaterials
        //            .Where(m => m.ProductionOutputId == d.Id)
        //            .Select(m => new MaterialAccountantDTO
        //            {
        //                ProductCode = m.CostObject,
        //                ProductName = m.CostItem,
        //                Uom = m.UOM,
        //                TotalQuantity = m.Amount ?? 0,
        //                QuantityPer = (m.Amount.HasValue && (d.Amount ?? 0) > 0)
        //                    ? Math.Round(m.Amount.Value / (d.Amount ?? 1), 3)
        //                    : 0
        //            }).ToList()
        //    }).ToList();

        //    return result;
        //}


        public async Task<ProductWithMaterialsDTO?> GetProductAndMaterialByCode(int productionOrderId, string productCode)
        {
            productCode = productCode?.ToUpper().Trim();
            Console.WriteLine($"🎯 Normalized ProductCode: '{productCode}'");

            var outputs = await _context.ProductionOutputs
                .Include(po => po.Product)
                .Where(po =>
                    po.ProductionOrderId == productionOrderId &&
                    po.Product.ProductCode.ToUpper() == productCode)
                .ToListAsync();

            if (outputs == null || outputs.Count == 0)
                return null;

            var totalQuantity = outputs.Sum(o => o.Amount ?? 0);

            var materials = await _context.ProductionMaterials
                .Include(m => m.Product)
                .Where(m => m.ProductionName.ToUpper() == productCode)
                .GroupBy(m => new { m.CostObject, m.CostItem, m.UOM })
                .Select(g => new MaterialAccountantDTO
                {
                    ProductCode = g.Key.CostObject,
                    ProductName = g.Key.CostItem,
                    Uom = g.Key.UOM,
                    QuantityPer = g.Sum(m => m.Amount ?? 0),
                    TotalQuantity = g.Sum(m => m.Amount ?? 0) * totalQuantity
                })
                .ToListAsync();

            return new ProductWithMaterialsDTO
            {
                Product = new ProductionOrderProductDTO
                {
                    ProductCode = outputs.First().Product.ProductCode,
                    ProductName = outputs.First().Product.ProductName,
                    Uom = outputs.First().Product.UOM,
                    Quantity = (int)totalQuantity
                },
                Materials = materials
            };
        }

        public async Task<bool> UpdateOutputInfo(int id, UpdateOutputDTO dto)
        {
            var output = await _context.ProductionOutputs
                    .Include(p => p.Product)
                    .FirstOrDefaultAsync(p => p.Id == id);
            if (output == null)
            {
                Console.WriteLine($" Không tìm thấy production_output với id = {id}");
                return false;
            }

            output.Product.ProductCode = dto.ProductCode;
            output.ProductName = dto.ProductName;
            output.UOM = dto.Uom;
            output.Amount = dto.Amount;
                
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> UpdateMaterialInfo(int id, UpdateMaterialDTO dto)
        {
            var material = await _context.ProductionMaterials.FindAsync(id);
            if (material == null) return false;

            material.CostObject = dto.ProductCode;
            material.CostItem = dto.ProductName;
            material.UOM = dto.Uom;
            material.Amount = dto.Amount;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CreateOutputInfo(int productionOrderId, CreateOutputDTO dto)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductCode == dto.ProductCode);

            if (product == null)
            {
                product = new Product
                {
                    ProductCode = dto.ProductCode,
                    ProductName = dto.ProductName,
                    UOM = dto.Uom
                };
                _context.Products.Add(product);
                await _context.SaveChangesAsync(); 
            }

            var output = new ProductionOutput
            {
                ProductId = product.Id,
                ProductName = dto.ProductName,
                UOM = dto.Uom,
                Amount = dto.Quantity,
                ProductionOrderId = productionOrderId
            };

            _context.ProductionOutputs.Add(output);
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> AddMaterialAsync(int productionOrderId, string productionCode, CreateMaterialDTO dto)
        {
            // Tìm thành phẩm tương ứng
            var output = await _context.ProductionOutputs
                .Include(o => o.Product)
                .FirstOrDefaultAsync(o =>
                    o.ProductionOrderId == productionOrderId &&
                    o.Product.ProductCode == productionCode);

            if (output == null)
            {
                Console.WriteLine($"Không tìm thấy thành phẩm: {productionCode} trong production order {productionOrderId}");
                return false;
            }
            var existingProduct = await _context.Products
                .FirstOrDefaultAsync(p => p.ProductCode.ToUpper() == dto.ProductCode.ToUpper());

            if (existingProduct == null)
            {
                Console.WriteLine($"Không tìm thấy product với mã {dto.ProductCode}. Không gán product_id.");
            }
            var material = new ProductionMaterial
            {
                ProductionId = output.ProductId,
                ProductionName = output.Product.ProductCode,
                ProductionOutputId = output.Id,
                CostObject = dto.ProductCode,
                CostItem = dto.ProductName,
                UOM = dto.Uom,
                Amount = dto.TotalQuantity,
                ProductId = existingProduct?.Id ?? 0
            };
            if (existingProduct == null)
            {
                throw new Exception($"Không tìm thấy product trong bảng Products với mã: {dto.ProductCode}");
            }

            _context.ProductionMaterials.Add(material);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}