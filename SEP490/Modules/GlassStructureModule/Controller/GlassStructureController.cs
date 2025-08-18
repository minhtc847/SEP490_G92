using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.Modules.GlassStructureModule.DTO;
using SEP490.Modules.GlassStructureModule.Service;

namespace SEP490.Modules.GlassStructureModule.Controller
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
            _service.UpdateGlassStructureById(id, dto);

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

        [HttpGet("by-product/{productId}")]
        public IActionResult GetByProductId(int productId)
        {
            var product = _context.Products.Include(p => p.GlassStructure).FirstOrDefault(p => p.Id == productId);
            if (product == null || product.GlassStructure == null)
                return NotFound(new { message = "Không tìm thấy cấu trúc kính cho sản phẩm này." });
            return Ok(product.GlassStructure);
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

        [HttpGet("product-codes")]
        public IActionResult GetProductCodes()
        {
            var productCodes = _service.GetAllProductCodes();
            return Ok(productCodes);
        }


    }
}
