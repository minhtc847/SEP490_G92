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


        [HttpPost("production-order/{productionOrderId}/check-completion")]
        public async Task<IActionResult> CheckAndUpdateProductionOrderStatus(int productionOrderId)
        {
            try
            {
                var result = await _chemicalExportService.CheckAndUpdateProductionOrderStatusAsync(productionOrderId);
                if (result)
                {
                    return Ok(new { message = "Lệnh sản xuất đã được chuyển sang trạng thái hoàn thành!", completed = true });
                }
                else
                {
                    return Ok(new { message = "Lệnh sản xuất chưa đủ điều kiện để hoàn thành.", completed = false });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi kiểm tra trạng thái lệnh sản xuất!", error = ex.Message });
            }
        }

        [HttpPost("production-order/{productionOrderId}/product/{productId}/update-plan-detail")]
        public async Task<IActionResult> UpdateProductionPlanDetailDone(int productionOrderId, int productId, [FromBody] UpdatePlanDetailRequest request)
        {
            try
            {
                var result = await _chemicalExportService.UpdateProductionPlanDetailDoneAsync(productionOrderId, productId, request.Quantity, request.IsIncrease);
                if (result)
                {
                    return Ok(new { message = "Cập nhật tiến độ kế hoạch sản xuất thành công!", updated = true });
                }
                else
                {
                    return Ok(new { message = "Không thể cập nhật tiến độ kế hoạch sản xuất.", updated = false });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi cập nhật tiến độ kế hoạch sản xuất!", error = ex.Message });
            }
        }
    }
} 