using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.FormularModule.DTO;
using SEP490.Modules.FormularModule.Services;

namespace SEP490.Modules.FormularModule.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FormularController : ControllerBase
    {
        private readonly IFormularService _formularService;

        public FormularController(IFormularService formularService)
        {
            _formularService = formularService;
        }

        [HttpGet]
        public ActionResult<List<FormularGroupDto>> GetAllFormulars()
        {
            var formulars = _formularService.GetAllFormularsGroupedByType();
            return Ok(formulars);
        }

        [HttpGet("type/{type}")]
        public ActionResult<List<FormularDto>> GetFormularsByType(string type)
        {
            var formulars = _formularService.GetFormularsByType(type);
            return Ok(formulars);
        }
    }
} 