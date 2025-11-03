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

        [HttpPost]
        public ActionResult<FormularDto> Create([FromBody] CreateFormularRequest request)
        {
            try
            {
                var created = _formularService.CreateFormular(request);
                return Ok(created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public ActionResult<FormularDto> Update(int id, [FromBody] UpdateFormularRequest request)
        {
            try
            {
                var updated = _formularService.UpdateFormular(id, request);
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                _formularService.DeleteFormular(id);
                return Ok(new { message = "Deleted" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 