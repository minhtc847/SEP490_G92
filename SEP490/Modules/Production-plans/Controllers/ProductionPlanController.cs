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
        
        [HttpGet("list")]
        public async Task<IActionResult> GetProductionPlanList()
        {
            var plans = await _productionPlanService.GetProductionPlanListAsync();
            return Ok(plans);
        }

        [HttpGet("detail/{id}")]
        public async Task<IActionResult> GetProductionPlanDetail(int id)
        {
            var detail = await _productionPlanService.GetProductionPlanDetailAsync(id);
            if (detail == null) return NotFound();
            return Ok(detail);
        }
    }
}
