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
        //[HttpGet("products-productionName/{productionOrderId}")]
        //public async Task<IActionResult> GetProductWithMaterials(int productionOrderId, [FromQuery] string productCode)
        //{
        //    var result = await _service.GetProductAndMaterialByCode(productionOrderId, productCode);

        //    if (result == null)
        //        return NotFound("Không tìm thấy sản phẩm hoặc định mức NVL.");

        //    return Ok(new List<ProductWithMaterialsDTO> { result });
        //}
        [HttpGet("production-order-info/{id}")]
        public async Task<IActionResult> GetProductionOrderInfo(int id)
        {
            var result = await _service.GetProductionOrderInfoAsync(id);
            if (result == null)
                return NotFound("Không tìm thấy lệnh sản xuất");

            return Ok(result);
        }

        [HttpGet("products-materials-by-output/{outputId}")]
        public async Task<IActionResult> GetProductWithMaterialsByOutputId(int outputId)
        {
            var result = await _service.GetProductAndMaterialByOutputId(outputId);
            if (result == null) return NotFound("Không tìm thấy dữ liệu.");
            return Ok(result);
        }

        [HttpPut("update-output-info/{id}")]
        public async Task<IActionResult> UpdateOutputInfo(int id, [FromBody] UpdateOutputDTO dto)
        {
            var success = await _service.UpdateOutputInfo(id, dto);
            if (!success)
                return NotFound("Không tìm thấy thành phẩm.");
            return Ok(new { message = "Cập nhật thành công." });
        }
        [HttpPut("update-material-info/{id}")]
        public async Task<IActionResult> UpdateMaterialInfo(int id, [FromBody] UpdateMaterialDTO dto)
        {
            var success = await _service.UpdateMaterialInfo(id, dto);
            if (!success)
                return NotFound("Không tìm thấy nguyên vật liệu.");
            return Ok(new { message = "Cập nhật thành công." });
        }
        [HttpPost("add-output-info/{id}")]
        public async Task<IActionResult> AddOutputInfo(int id, [FromBody] CreateOutputDTO dto)
        {
            var success = await _service.CreateOutputInfo(id, dto);
            if (!success)
                return BadRequest(new { message = "Thêm thất bại." });

            return Ok(new { message = "Thêm thành phẩm thành công." });
        }
        [HttpPost("add-material-info/{productionOrderId}")]
        public async Task<IActionResult> AddMaterial(int productionOrderId, int outputId, [FromBody] CreateMaterialDTO dto)
        {
            try
            {
                var result = await _service.AddMaterialAsync(productionOrderId, outputId, dto);
                if (result)
                {
                    return Ok("Material added successfully");
                }
                return NotFound("Output not found");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("delete-output/{id}")]
        public async Task<IActionResult> DeleteOutput(int id)
        {
            try
            {
                var success = await _service.DeleteOutputAsync(id);
                if (!success)
                    return NotFound("Không tìm thấy thành phẩm");

                return Ok(new { message = "Xóa thành phẩm thành công"});
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi xóa thành phẩm", error = ex.Message });
            }
        }

        [HttpDelete("delete-material/{id}")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            try
            {
                var success = await _service.DeleteMaterialAsync(id);
                if (!success)
                    return NotFound("Không tìm thấy nguyên vật liệu");

                return Ok(new { message = "Xóa nguyên vật liệu thành công"});
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi xóa nguyên vật liệu", error = ex.Message });
            }
        }

    }
}