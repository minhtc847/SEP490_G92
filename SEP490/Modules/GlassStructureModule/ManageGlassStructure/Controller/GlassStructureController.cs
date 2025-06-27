using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.Modules.GlassStructureModule.ManageGlassStructure.DTO;
using SEP490.Modules.GlassStructureModule.ManageGlassStructure.Service;

namespace SEP490.Modules.GlassStructureModule.ManageGlassStructure.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class GlassStructureController : ControllerBase
    {
        private readonly IGlassStructureService _service;
        private readonly SEP490DbContext _context;

        public GlassStructureController(IGlassStructureService service, SEP490DbContext context)
        {
            _service = service;
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var list = _service.GetAllGlassStructures();
            return Ok(list);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var result = _service.GetGlassStructureById(id);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy cấu trúc kính với ID này." });

            return Ok(result);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] UpdateGlassStructureDto dto)
        {
            var success = _service.UpdateGlassStructureById(id, dto);
            if (!success)
                return NotFound(new { message = "Không tìm thấy cấu trúc kính để cập nhật." });

            return Ok(new { message = "Cập nhật thành công!" });
        }

        [HttpPost]
        public IActionResult Create([FromBody] UpdateGlassStructureDto dto)
        {
            if (_context.GlassStructures.Any(p => p.ProductCode == dto.ProductCode))
                return BadRequest("Mã sản phẩm đã tồn tại");

            if (_context.GlassStructures.Any(p => p.ProductName == dto.ProductName))
                return BadRequest("Tên sản phẩm đã tồn tại");

            try
            {
                var created = _service.AddGlassStructure(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi tạo cấu trúc kính", details = ex.Message });
            }
        }


        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                var result = _service.DeleteGlassStructureById(id);
                if (!result)
                    return NotFound(new { message = "Không tìm thấy cấu trúc kính để xoá." });

                return Ok(new { message = "Xoá thành công." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("check-code")]
        public IActionResult CheckProductCodeExists([FromQuery] string code)
        {
            bool exists = _context.GlassStructures.Any(p => p.ProductCode == code);
            return Ok(new { exists });
        }

        [HttpGet("check-name")]
        public IActionResult CheckProductNameExists([FromQuery] string name)
        {
            bool exists = _context.GlassStructures.Any(p => p.ProductName == name);
            return Ok(new { exists });
        }


        [HttpGet("categories")]
        public IActionResult GetCategories()
        {
            var categories = _context.GlassStructures
                .Select(p => p.Category)
                .Distinct()
                .ToList();

            return Ok(categories);
        }


    }
}
