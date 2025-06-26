using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ProductionOrders.Services;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MaterialsController : ControllerBase
    {
        private readonly IMaterialsService _materialsService;

        public MaterialsController(IMaterialsService materialsService)
        {
            _materialsService = materialsService;
        }

        [HttpPost("add-materials")]
        public async Task<IActionResult> AddMaterials([FromQuery] int glassProductId, [FromQuery] int productionOutputId)
        {
            var result = await _materialsService.AddMaterialsForProductAsync(glassProductId, productionOutputId);
            return Ok(result);
        }

        [HttpGet("by-product/{productId}")]
        public async Task<IActionResult> GetMaterialsByProductId(int productId, int productOutputId)
        {
            var materials = await _materialsService.GetMaterialsByProductIdAsync(productId, productOutputId);
            return Ok(materials);
        }
    }
}
