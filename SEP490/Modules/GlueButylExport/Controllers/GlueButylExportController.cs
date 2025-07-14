using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.GlueButylExport.DTO;
using SEP490.Modules.GlueButylExport.Services;

namespace SEP490.Modules.GlueButylExport.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GlueButylExportController : ControllerBase
    {
        private readonly IGlueButylExportService _glueButylExportService;
        public GlueButylExportController(IGlueButylExportService glueButylExportService)
        {
            _glueButylExportService = glueButylExportService;
        }
        [HttpPost("add")]
        public async Task<IActionResult> AddGlueButylExport(CreateNewDTO createNewDTO)
        {
            try
            {
                await _glueButylExportService.AddGlueButylExport(createNewDTO);
                return Ok("Glue Butyl Export added successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error adding Glue Butyl Export: {ex}");
            }
        }
        [HttpGet("get-all/{productionPlanId}")]
        public async Task<IActionResult> GetAllExportsByProductionPlanId(int productionPlanId)
        {
            try
            {
                var exports = await _glueButylExportService.getAllExportByProductionPlanId(productionPlanId);
                return Ok(exports);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving exports: {ex}");
            }
        }
        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetExportById(int id)
        {
            try
            {
                var export = await _glueButylExportService.GetExportById(id);
                return Ok(export);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Error retrieving export: {ex}");
            }
        }
    }
}
