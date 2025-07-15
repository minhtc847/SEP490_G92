using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Accountant.DTO;
using SEP490.Modules.ProductionOrders.DTO;
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
                    Status = po.ProductionStatus,

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
                    OutputId = po.Id,
                    ProductName = po.ProductName,
                    Uom = po.UOM,
                    Quantity = po.Amount ?? 0
                })
                .ToList();

            return products;
        }
        public async Task<ProductionOrderInfoDTO?> GetProductionOrderInfoAsync(int id)
        {
            var po = await _context.ProductionOrders
                .Where(po => po.Id == id)
                .Select(po => new ProductionOrderInfoDTO
                {
                    Id = po.Id,
                    Description = po.Description
                })
                .FirstOrDefaultAsync();

            return po;
        }

        
        public async Task<ProductWithMaterialsDTO?> GetProductAndMaterialByOutputId(int outputId)
        {
            var output = await _context.ProductionOutputs
                .Include(po => po.Product)
                .FirstOrDefaultAsync(po => po.Id == outputId);

            if (output == null)
            {
                Console.WriteLine($"Không tìm thấy ProductionOutput với Id: {outputId}");
                return null;
            }

            //var productCode = output.Product.ProductCode.ToUpper().Trim();
            var totalQuantity = output.Amount ?? 0;

            var materials = await _context.ProductionMaterials
                .Include(m => m.Product)
                .Where(m => m.ProductionOutputId == outputId)
                .Select(m => new MaterialAccountantDTO
                {
                    Id = m.Id, 
                    ProductName = m.CostItem,
                    Uom = m.UOM,
                    QuantityPer = m.Amount ?? 0,
                    TotalQuantity = m.Amount ?? 0
                })
                .ToListAsync();

            return new ProductWithMaterialsDTO
            {
                Product = new ProductionOrderProductDTO
                {
                    OutputId = output.Id,
                    ProductName = output.Product.ProductName,
                    Uom = output.Product.UOM,
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


            material.CostItem = dto.ProductName;
            material.UOM = dto.Uom;
            material.Amount = dto.Amount;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CreateOutputInfo(int productionOrderId, CreateOutputDTO dto)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductName == dto.ProductName);

            if (product == null)
            {
                product = new Product
                {
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


        public async Task<bool> AddMaterialAsync(int productionOrderId, int outputId, CreateMaterialDTO dto)
        {
            var output = await _context.ProductionOutputs
                .Include(o => o.Product)
                .FirstOrDefaultAsync(o =>
                    o.ProductionOrderId == productionOrderId &&
                    o.Id == outputId);

            if (output == null)
            {
                Console.WriteLine($"Không tìm thấy output với ID: {outputId} trong production order {productionOrderId}");
                return false;
            }

            var existingProduct = await _context.Products
                .FirstOrDefaultAsync(p => p.ProductName.ToUpper() == dto.ProductName.ToUpper());

            if (existingProduct == null)
            {
                Console.WriteLine($"Không tìm thấy product với mã {dto.ProductName}. Không gán product_id.");
            }

            var material = new ProductionMaterial
            {
                ProductionId = output.ProductId,
                ProductionName = output.Product.ProductName,
                ProductionOutputId = output.Id,
                CostItem = dto.ProductName,
                UOM = dto.Uom,
                Amount = dto.TotalQuantity,
                ProductId = existingProduct?.Id ?? 0
            };

            if (existingProduct == null)
            {
                throw new Exception($"Không tìm thấy product");
            }

            _context.ProductionMaterials.Add(material);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}