using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Accountant.DTO;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Modules.ProductionOrders.Services;

namespace SEP490.Modules.Accountant.Services
{
    public class ProductionAccountantService : BaseScopedService, IProductionAccountantService
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
                        .Sum(poOut => Convert.ToInt32(poOut.Amount ?? 0)),
                    //Status = po.Status,
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
                    Uom = ConvertStringUOMToInt(po.Product.UOM),
                    Quantity = Convert.ToInt32(po.Amount ?? 0),
                    //Done = po.Done ?? 0
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
                    Description = po.Description,
                    Type = po.Type,
                    Status = po.Status.HasValue ? po.Status.Value.ToString() : null
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
                Console.WriteLine("Không tìm thấy ProductionOutput ");
                return null;
            }

            var totalQuantity = output.Amount ?? 0;

            var materials = await _context.ProductionMaterials
                .Include(m => m.Product)
                .Where(m => m.ProductionOutputId == outputId)
                .Select(m => new MaterialAccountantDTO
                {
                    Id = m.Id,
                    ProductName = m.Product.ProductName,
                    Uom = ConvertStringUOMToInt(m.Product.UOM), // dung static method
                    QuantityPer = Convert.ToInt32(m.Amount ?? 0),
                    TotalQuantity = Convert.ToInt32(m.Amount ?? 0)
                })
                .ToListAsync();

            return new ProductWithMaterialsDTO
            {
                Product = new ProductionOrderProductDTO
                {
                    OutputId = output.Id,
                    ProductName = output.Product.ProductName,
                    Uom = ConvertStringUOMToInt(output.Product.UOM), // dung static method
                    Quantity = Convert.ToInt32(totalQuantity)
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
                Console.WriteLine(" Không tìm thấy production_output ");
                return false;
            }

            output.ProductName = dto.ProductName;
            output.Amount = dto.Amount;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateMaterialInfo(int id, UpdateMaterialDTO dto)
        {
            var d = await _context.ProductionMaterials.FindAsync(id);
            if (d == null) return false;


            var newProduct = await _context.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (newProduct == null)
            {
                return false;
            }

            d.ProductId = dto.ProductId;
            d.Amount = dto.Amount;

            // d.ProductName = newProduct.ProductName; 
            // d.UOM = (UOM)newProduct.UOM; 
            //d.Product.ProductName = dto.ProductName; 
            //product.UOM = ConvertIntToStringUOM(dto.Uom); 
            //d.UOM = (UOM)dto.Uom; 

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
                    UOM = ConvertIntToStringUOM(dto.Uom)
                };
                _context.Products.Add(product);
                await _context.SaveChangesAsync();
            }

            var output = new ProductionOutput
            {
                ProductId = product.Id,
                ProductName = dto.ProductName,
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
                Console.WriteLine("Không tìm thấy output trong production order");
                return false;
            }

            var productToAdd = await _context.Products
                .FirstOrDefaultAsync(p => p.Id == dto.ProductId);

            if (productToAdd == null)
            {
                Console.WriteLine("Không tìm thấy product ");
            }

            var material = new ProductionMaterial
            {
                ProductionOutputId = output.Id,
                UOM = (UOM)dto.Uom,
                Amount = dto.TotalQuantity,
                ProductId = productToAdd.Id
            };

            _context.ProductionMaterials.Add(material);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteOutputAsync(int outputId)
        {
            try
            {
                Console.WriteLine($"Felete ProductionOutput with ID: {outputId}");

                var output = await _context.ProductionOutputs
                    .FirstOrDefaultAsync(po => po.Id == outputId);

                Console.WriteLine($"Found output: {output != null}");

                if (output == null)
                {
                    Console.WriteLine($"Không tìm thấy ProductionOutput với ID: {outputId}");
                    return false;
                }

                Console.WriteLine($"OutputID: {output.Id}, ProductName: {output.ProductName}");

                var relatedMaterials = await _context.ProductionMaterials
                    .Where(pm => pm.ProductionOutputId == outputId)
                    .ToListAsync();

                Console.WriteLine($"Found {relatedMaterials.Count} related materials to delete");

                if (relatedMaterials.Any())
                {
                    _context.ProductionMaterials.RemoveRange(relatedMaterials);
                    Console.WriteLine($"Removed {relatedMaterials.Count} related materials");
                }

                _context.ProductionOutputs.Remove(output);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Delete ProductionOutput Successfully");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi xóa ProductionOutput: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> DeleteMaterialAsync(int materialId)
        {
            try
            {
                var material = await _context.ProductionMaterials.FindAsync(materialId);

                if (material == null)
                {
                    Console.WriteLine("Không tìm thấy ProductionMaterial để xóa");
                    return false;
                }

                _context.ProductionMaterials.Remove(material);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi khi xóa ProductionMaterial: {ex.Message}");
                return false;
            }
        }

        private static int ConvertStringUOMToInt(string? uom)
        {
            if (string.IsNullOrEmpty(uom))
                return 0;

            return uom.ToLower() switch
            {
                "tấm" => (int)UOM.Tấm,
                "kg" => (int)UOM.Kg,
                "m" => (int)UOM.M,
                "l" => (int)UOM.L,
                "ml" => (int)UOM.Ml,
                "g" => (int)UOM.g,
                _ => 0
            };
        }

        private static string ConvertIntToStringUOM(int uom)
        {
            return ((UOM)uom).ToString();
        }
    }
}
