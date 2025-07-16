using Microsoft.AspNetCore.Mvc;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Modules.ProductionOrders.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CuttingGlassManagementController : ControllerBase
    {
        private readonly ICuttingGlassManagementService _service;
        public CuttingGlassManagementController(ICuttingGlassManagementService service)
        {
            _service = service;
        }

        [HttpGet("summary/{productionOrderId}")]
        public async Task<ActionResult<object>> GetCuttingGlassSummary(int productionOrderId)
        {
            var result = await _service.GetCuttingGlassSummaryAsync(productionOrderId);
            return Ok(result);
        }

        [HttpGet("products/thanhpham")]
        public async Task<ActionResult<List<Product>>> GetThanhPhamProducts()
        {
            var products = await _service.GetThanhPhamProductsAsync();
            return Ok(products);
        }

        [HttpPost("create-product")]
        public async Task<ActionResult<Product>> CreateProduct([FromBody] CreateProductionProductDto dto)
        {
            var product = await _service.CreateProductAsync(dto);
            return Ok(product);
        }

        [HttpPost("create-production-output")]
        public async Task<ActionResult<ProductionOutput>> CreateProductionOutput([FromBody] CreateProductionOutputDto dto)
        {
            var output = await _service.CreateProductionOutputAsync(dto);
            return Ok(output);
        }

        [HttpPost("create-material")]
        public async Task<ActionResult<CutGlassInvoiceMaterial>> CreateMaterial([FromBody] CutGlassInvoiceMaterial material)
        {
            var result = await _service.CreateMaterialAsync(material);
            return Ok(result);
        }

        [HttpPost("create-cut-glass-output")]
        public async Task<ActionResult<CutGlassInvoiceOutput>> CreateCutGlassOutput([FromBody] CutGlassInvoiceOutputCreateDto dto)
        {
            var output = await _service.CreateCutGlassOutputAsync(dto);
            return Ok(output);
        }

        [HttpPut("update-material/{id}")]
        public async Task<ActionResult<CutGlassInvoiceMaterial>> UpdateMaterial(int id, [FromBody] UpdateMaterialDto dto)
        {
            var result = await _service.UpdateMaterialAsync(id, dto);
            return Ok(result);
        }

        [HttpPut("update-cut-glass-output/{id}")]
        public async Task<ActionResult<CutGlassInvoiceOutput>> UpdateCutGlassOutput(int id, [FromBody] UpdateCutGlassOutputDto dto)
        {
            var output = await _service.UpdateCutGlassOutputAsync(id, dto);
            return Ok(output);
        }

        [HttpDelete("delete-material/{id}")]
        public async Task<ActionResult> DeleteMaterial(int id)
        {
            await _service.DeleteMaterialAsync(id);
            return Ok();
        }

        [HttpDelete("delete-cut-glass-output/{id}")]
        public async Task<ActionResult> DeleteCutGlassOutput(int id)
        {
            await _service.DeleteCutGlassOutputAsync(id);
            return Ok();
        }
    }
} 