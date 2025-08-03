using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ChemicalExportModule.DTO;
using SEP490.Modules.ChemicalExportModule.Service;

namespace SEP490.Modules.ChemicalExportModule.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChemicalExportController : ControllerBase
    {
        private readonly IChemicalExportService _chemicalExportService;

        public ChemicalExportController(IChemicalExportService chemicalExportService)
        {
            _chemicalExportService = chemicalExportService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateChemicalExport([FromBody] CreateChemicalExportDto dto)
        {
            try
            {
                var result = await _chemicalExportService.CreateChemicalExportAsync(dto);
                return Ok(new { message = "Tạo phiếu xuất hóa chất thành công!", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Tạo phiếu xuất hóa chất thất bại!", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetChemicalExportById(int id)
        {
            try
            {
                var result = await _chemicalExportService.GetChemicalExportByIdAsync(id);
                if (result == null)
                    return NotFound(new { message = "Không tìm thấy phiếu xuất hóa chất." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy thông tin phiếu xuất hóa chất!", error = ex.Message });
            }
        }

        [HttpGet("production-order/{productionOrderId}")]
        public async Task<IActionResult> GetChemicalExportsByProductionOrder(int productionOrderId)
        {
            try
            {
                var result = await _chemicalExportService.GetChemicalExportsByProductionOrderAsync(productionOrderId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy danh sách phiếu xuất hóa chất!", error = ex.Message });
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllChemicalExports()
        {
            try
            {
                var result = await _chemicalExportService.GetAllChemicalExportsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy danh sách phiếu xuất hóa chất!", error = ex.Message });
            }
        }

        [HttpGet("production-order/{productionOrderId}/products")]
        public async Task<IActionResult> GetProductionOrderProducts(int productionOrderId)
        {
            try
            {
                var result = await _chemicalExportService.GetProductionOrderProductsAsync(productionOrderId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy thông tin sản phẩm lệnh sản xuất!", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChemicalExport(int id)
        {
            try
            {
                var result = await _chemicalExportService.DeleteChemicalExportAsync(id);
                if (!result)
                    return NotFound(new { message = "Không tìm thấy phiếu xuất hóa chất để xóa." });

                return Ok(new { message = "Xóa phiếu xuất hóa chất thành công!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi xóa phiếu xuất hóa chất!", error = ex.Message });
            }
        }
    }
} 