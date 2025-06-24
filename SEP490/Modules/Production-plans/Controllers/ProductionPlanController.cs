using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.DB.Models;
using SEP490.Modules.Production_plans.DTO;
using SEP490.Modules.Production_plans.Services;

namespace SEP490.Modules.Production_plans.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductionPlanController : ControllerBase
    {

        private readonly IProductionPlanService _productionPlanService;
        public ProductionPlanController(IProductionPlanService productionPlanService)
        {
            _productionPlanService = productionPlanService;
        }
        /// Lấy danh sách kế hoạch sản xuất
        [HttpGet]
        public async Task<ActionResult<List<ProductionPlan>>> GetAll()
        {
            try
            {
                var result = await _productionPlanService.GetAllAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        [HttpGet("Details/{planId}")]
        public async Task<IActionResult> GetDetails(int planId)
        {
            var data = await _productionPlanService.GetProductionPlanDetailsAsync(planId);
            return Ok(data);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreatePlan(string orderCode, [FromBody] CreateProductionPlanInputDTO dto)
        {
            await _productionPlanService.CreateProductionPlanAsync(dto);
            return Ok(new { message = "Tạo kế hoạch sản xuất thành công!" });
        }

    }
}
