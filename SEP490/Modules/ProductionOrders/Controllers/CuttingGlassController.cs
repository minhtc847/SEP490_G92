using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CuttingGlassManagementController : ControllerBase
    {
        private readonly SEP490DbContext _context;

        public CuttingGlassManagementController(SEP490DbContext context)
        {
            _context = context;
        }

        [HttpGet("summary/{productionOrderId}")]
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
            // Kính dư: chỉ lấy các kính dư có material gắn với lệnh sản xuất này
            var glassOutputs = await _context.CutGlassInvoiceOutputs
                .Where(x => x.IsDC == true &&
                    x.CutGlassInvoiceMaterial != null &&
                    x.CutGlassInvoiceMaterial.productionOrderId == productionOrderId)
                .Include(x => x.ProductionOutput)
                .ThenInclude(po => po.Product)
                .Include(x => x.CutGlassInvoiceMaterial)
                .ToListAsync();
            // Bán thành phẩm: lấy như cũ
            var banThanhPhamOutputs = await _context.CutGlassInvoiceOutputs
                .Where(x => x.IsDC == false && x.ProductionOutput.ProductionOrderId == productionOrderId)
                .Include(x => x.ProductionOutput)
                .ThenInclude(po => po.Product)
                .ToListAsync();
            var glassOutputDtos = glassOutputs.Select(x => new {
                x.Id,
                x.ProductionOutputId,
                ProductName = x.ProductionOutput?.Product?.ProductName,
                x.Quantity,
                x.IsDC,
                x.Note,
                MaterialId = x.CutGlassInvoiceMaterialId,
                MaterialName = x.CutGlassInvoiceMaterial?.Product?.ProductName,
                x.CreatedAt,
                x.UpdatedAt
            }).ToList();
            var banThanhPhamDtos = banThanhPhamOutputs.Select(x => new {
                x.Id,
                x.ProductionOutputId,
                ProductName = x.ProductionOutput?.Product?.ProductName,
                x.Quantity,
                x.IsDC,
                x.Note,
                MaterialId = (int?)null,
                MaterialName = (string)null,
                x.CreatedAt,
                x.UpdatedAt
            }).ToList();
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
                    x.note,
                    x.CreatedAt,
                    x.UpdatedAt
                }),
                glassOutputs = ((IEnumerable<object>)glassOutputDtos).Concat(banThanhPhamDtos).ToList()
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

        [HttpPost("create-product")]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] CreateProductionProductDto dto)
        {
            var product = new Product
            {
                ProductCode = dto.ProductCode,
                ProductName = dto.ProductName,
                ProductType = "Thành phẩm",
                UOM = dto.UOM
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return Ok(product);
        }

        [HttpPost("create-production-output")]
        public async Task<ActionResult<ProductionOutput>> CreateProductionOutput([FromBody] CreateProductionOutputDto dto)
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

        [HttpPost("create-material")]
        public async Task<ActionResult<CutGlassInvoiceMaterial>> CreateMaterial([FromBody] CutGlassInvoiceMaterial material)
        {
            material.CreatedAt = DateTime.Now;
            material.UpdatedAt = DateTime.Now;
            _context.CutGlassInvoiceMaterials.Add(material);
            await _context.SaveChangesAsync();
            return Ok(material);
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
                Note = dto.Note,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            _context.CutGlassInvoiceOutputs.Add(output);
            await _context.SaveChangesAsync();
            return Ok(output);
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
            material.UpdatedAt = DateTime.Now;

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
            output.UpdatedAt = DateTime.Now;

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
            return Ok();
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
            return Ok();
        }
    }
} 