using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.Accountant.DTO;
using SEP490.Modules.Accountant.Services;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Modules.ProductionOrders.Services;

namespace SEP490.Modules.Accountant.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductionAccountantControllers : ControllerBase
    {
        private readonly IProductionAccountantService _service;
        public ProductionAccountantControllers(IProductionAccountantService productionAccountantService)
        {
            _service = productionAccountantService;
        }
        [HttpGet]
        public ActionResult<List<AccountantDTO>> GetAll()
        {
            var result = _service.GetAll();
            return Ok(result);
        }
        [HttpGet("production-ordersDetails/{id}")]
        public IActionResult GetProductsByProductionOrder(int id)
        {
            var products = _service.GetProductsByProductionOrderId(id);
            return Ok(products);
        }
        [HttpGet("products/{productionOrderId}")]
        public async Task<IActionResult> GetProductsWithMaterials(int productionOrderId)
        {
            var result = await _service.GetProductAndMaterialByProductionOrderId(productionOrderId);
            return Ok(result);
        }
        [HttpGet("products-productionName/{productionOrderId}")]
        public async Task<IActionResult> GetProductWithMaterials(int productionOrderId, [FromQuery] string productCode)
        {
            var result = await _service.GetProductAndMaterialByCode(productionOrderId, productCode);

            if (result == null)
                return NotFound("Không tìm thấy sản phẩm hoặc định mức NVL.");

            return Ok(new List<ProductWithMaterialsDTO> { result });
        }
    }
}