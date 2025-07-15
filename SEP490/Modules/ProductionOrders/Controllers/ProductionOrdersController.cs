using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ProductionOrders.Services;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using Microsoft.EntityFrameworkCore;
using SEP490.DB;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductionOrdersController : ControllerBase
    {
        private readonly IProductionOrdersService _productionOrdersService;
        private readonly IProductionOutputService _productionOutputService;
        private readonly SEP490DbContext _context;
        public ProductionOrdersController(IProductionOrdersService productionOrdersService, IProductionOutputService productionOutputService, SEP490DbContext context)
        {
            _productionOrdersService = productionOrdersService;
            _productionOutputService = productionOutputService;
            _context = context;
        }

        [HttpGet("by-plan/{productionPlanId}")]
        public async Task<ActionResult<List<ProductionOrdersByPlanDto>>> GetByPlanId(int productionPlanId)
        {
            var orders = await _productionOrdersService.GetProductionOrdersByPlanIdAsync(productionPlanId);
            if (orders == null || !orders.Any())
            {
                return NotFound($"No production orders found for plan ID {productionPlanId}");
            }
            return Ok(orders);
        }

        [HttpGet("outputs/{productionOrderId}")]
        public async Task<ActionResult<List<ProductionOutputDto>>> GetOutputsByProductionOrderId(int productionOrderId)
        {
            var outputs = await _productionOutputService.GetByProductionOrderIdAsync(productionOrderId);
            if (outputs == null || !outputs.Any())
            {
                return NotFound($"No production outputs found for production order ID {productionOrderId}");
            }
            return Ok(outputs);
        }

        [HttpPost("create-product")]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] Product product)
        {
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [HttpPost("create-production-output")]
        public async Task<ActionResult<ProductionOutput>> CreateProductionOutput([FromBody] ProductionOutputCreateDto dto)
        {
            var output = new ProductionOutput
            {
                ProductId = dto.ProductId,
                Amount = dto.Amount,
                ProductionOrderId = dto.ProductionOrderId
            };
            _context.ProductionOutputs.Add(output);
            await _context.SaveChangesAsync();
            return Ok(output);
        }

        [HttpPost("create-cut-glass-output")]
        public async Task<ActionResult<CutGlassInvoiceOutput>> CreateCutGlassOutput([FromBody] CutGlassInvoiceOutputCreateDto dto)
        {
            var output = new CutGlassInvoiceOutput
            {
                CutGlassInvoiceMaterialId = dto.CutGlassInvoiceMaterialId,
                ProductionOutputId = dto.ProductionOutputId,
                Quantity = (int)dto.Quantity,
                IsDC = dto.IsDC,
                Note = dto.Note
            };
            _context.CutGlassInvoiceOutputs.Add(output);
            await _context.SaveChangesAsync();
            return Ok(output);
        }

        [HttpPost("create-material")]
        public async Task<ActionResult<CutGlassInvoiceMaterial>> CreateMaterial([FromBody] CutGlassInvoiceMaterial material)
        {
            _context.CutGlassInvoiceMaterials.Add(material);
            await _context.SaveChangesAsync();
            return Ok(material);
        }

        [HttpGet("cutting-glass-summary/{productionOrderId}")]
        public async Task<ActionResult<object>> GetCuttingGlassSummary(int productionOrderId)
        {
            // Thành phẩm
            var outputs = await _context.ProductionOutputs
                .Where(x => x.ProductionOrderId == productionOrderId)
                .Include(x => x.Product)
                .ToListAsync();
            // Nguyên vật liệu
            var materials = await _context.CutGlassInvoiceMaterials
                .Where(x => x.productionOrderId == productionOrderId)
                .Include(x => x.Product)
                .ToListAsync();
            // Kính dư (CutGlassInvoiceOutput, IsDC=true)
            var glassOutputs = await _context.CutGlassInvoiceOutputs
                .Where(x =>
                    x.IsDC == true
                    || (x.IsDC == false && x.ProductionOutput.ProductionOrderId == productionOrderId)
                )
                .Include(x => x.ProductionOutput)
                .ThenInclude(po => po.Product)
                .ToListAsync();
            return Ok(new {
                outputs = outputs.Select(x => new {
                    x.Id,
                    x.ProductId,
                    ProductName = x.Product?.ProductName,
                    x.UOM,
                    x.Amount
                }),
                materials = materials.Select(x => new {
                    x.Id,
                    x.productId,
                    ProductName = x.Product?.ProductName,
                    x.quantity,
                    x.note
                }),
                glassOutputs = glassOutputs.Select(x => new {
                    x.Id,
                    x.ProductionOutputId,
                    ProductName = x.ProductionOutput?.Product?.ProductName,
                    x.Quantity,
                    x.IsDC,
                    x.Note
                })
            });
        }

        [HttpGet("products/thanhpham")]
        public async Task<ActionResult<List<Product>>> GetThanhPhamProducts()
        {
            var products = await _context.Products
                .Where(x => x.ProductType == "Thành phẩm")
                .ToListAsync();
            return Ok(products);
        }

        [HttpPut("update-material/{id}")]
        public async Task<ActionResult<CutGlassInvoiceMaterial>> UpdateMaterial(int id, [FromBody] UpdateMaterialDto dto)
        {
            var material = await _context.CutGlassInvoiceMaterials.FindAsync(id);
            if (material == null)
            {
                return NotFound($"Material with ID {id} not found");
            }

            material.quantity = dto.Quantity;
            material.note = dto.Note;

            await _context.SaveChangesAsync();
            return Ok(material);
        }

        [HttpPut("update-cut-glass-output/{id}")]
        public async Task<ActionResult<CutGlassInvoiceOutput>> UpdateCutGlassOutput(int id, [FromBody] UpdateCutGlassOutputDto dto)
        {
            var output = await _context.CutGlassInvoiceOutputs.FindAsync(id);
            if (output == null)
            {
                return NotFound($"Cut glass output with ID {id} not found");
            }

            output.Quantity = dto.Quantity;
            output.Note = dto.Note;

            await _context.SaveChangesAsync();
            return Ok(output);
        }

        [HttpDelete("delete-material/{id}")]
        public async Task<ActionResult> DeleteMaterial(int id)
        {
            var material = await _context.CutGlassInvoiceMaterials.FindAsync(id);
            if (material == null)
            {
                return NotFound($"Material with ID {id} not found");
            }

            _context.CutGlassInvoiceMaterials.Remove(material);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Material deleted successfully" });
        }

        [HttpDelete("delete-cut-glass-output/{id}")]
        public async Task<ActionResult> DeleteCutGlassOutput(int id)
        {
            var output = await _context.CutGlassInvoiceOutputs.FindAsync(id);
            if (output == null)
            {
                return NotFound($"Cut glass output with ID {id} not found");
            }

            _context.CutGlassInvoiceOutputs.Remove(output);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Cut glass output deleted successfully" });
        }
    }
}
