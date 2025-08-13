using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.InventorySlipModule.DTO;
using SEP490.Modules.InventorySlipModule.Service;

namespace SEP490.Modules.InventorySlipModule.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventorySlipController : ControllerBase
    {
        private readonly IInventorySlipService _inventorySlipService;

        public InventorySlipController(IInventorySlipService inventorySlipService)
        {
            _inventorySlipService = inventorySlipService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateInventorySlip([FromBody] CreateInventorySlipDto dto)
        {
            try
            {
                // Validate input
                if (!await _inventorySlipService.ValidateSlipCreationAsync(dto))
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ!" });
                }

                var result = await _inventorySlipService.CreateInventorySlipAsync(dto);
                return Ok(new { message = "Tạo phiếu kho thành công!", data = result });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Tạo phiếu kho thất bại!", error = ex.Message });
            }
        }

        [HttpPost("{slipId}/mappings")]
        public async Task<IActionResult> AddMappings(int slipId, [FromBody] List<CreateMaterialOutputMappingDto> mappings)
        {
            try
            {
                var ok = await _inventorySlipService.AddMappingsAsync(slipId, mappings);
                if (!ok) return BadRequest(new { message = "Không thể thêm mapping" });
                return Ok(new { message = "Thêm mapping thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi thêm mapping!", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInventorySlipById(int id)
        {
            try
            {
                var result = await _inventorySlipService.GetInventorySlipByIdAsync(id);
                if (result == null)
                    return NotFound(new { message = "Không tìm thấy phiếu kho." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy thông tin phiếu kho!", error = ex.Message });
            }
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllInventorySlips()
        {
            try
            {
                var result = await _inventorySlipService.GetAllInventorySlipsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy danh sách phiếu kho!", error = ex.Message });
            }
        }

        [HttpGet("production-order/{productionOrderId}")]
        public async Task<IActionResult> GetInventorySlipsByProductionOrder(int productionOrderId)
        {
            try
            {
                var result = await _inventorySlipService.GetInventorySlipsByProductionOrderAsync(productionOrderId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy danh sách phiếu kho!", error = ex.Message });
            }
        }

        [HttpGet("production-order/{productionOrderId}/info")]
        public async Task<IActionResult> GetProductionOrderInfo(int productionOrderId)
        {
            try
            {
                var result = await _inventorySlipService.GetProductionOrderInfoAsync(productionOrderId);
                if (result == null)
                    return NotFound(new { message = "Không tìm thấy thông tin lệnh sản xuất." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy thông tin lệnh sản xuất!", error = ex.Message });
            }
        }

        [HttpGet("input-material/{inputDetailId}/outputs")]
        public async Task<IActionResult> GetOutputsFromInputMaterial(int inputDetailId)
        {
            try
            {
                var result = await _inventorySlipService.GetOutputsFromInputMaterialAsync(inputDetailId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy thông tin sản phẩm đầu ra!", error = ex.Message });
            }
        }

        [HttpGet("output-product/{outputDetailId}/inputs")]
        public async Task<IActionResult> GetInputMaterialsForOutput(int outputDetailId)
        {
            try
            {
                var result = await _inventorySlipService.GetInputMaterialsForOutputAsync(outputDetailId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi lấy thông tin nguyên liệu đầu vào!", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteInventorySlip(int id)
        {
            try
            {
                var result = await _inventorySlipService.DeleteInventorySlipAsync(id);
                if (!result)
                    return NotFound(new { message = "Không tìm thấy phiếu kho để xóa." });

                return Ok(new { message = "Xóa phiếu kho thành công!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi xóa phiếu kho!", error = ex.Message });
            }
        }

        // Special endpoints for different slip types
        [HttpPost("cut-glass")]
        public async Task<IActionResult> CreateCutGlassSlip([FromBody] CreateInventorySlipDto dto)
        {
            try
            {
                if (!await _inventorySlipService.ValidateSlipCreationAsync(dto))
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ!" });
                }

                var result = await _inventorySlipService.CreateCutGlassSlipAsync(dto);
                return Ok(new { message = "Tạo phiếu cắt kính thành công!", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Tạo phiếu cắt kính thất bại!", error = ex.Message });
            }
        }

        [HttpPost("chemical-export")]
        public async Task<IActionResult> CreateChemicalExportSlip([FromBody] CreateInventorySlipDto dto)
        {
            try
            {
                if (!await _inventorySlipService.ValidateSlipCreationAsync(dto))
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ!" });
                }

                var result = await _inventorySlipService.CreateChemicalExportSlipAsync(dto);
                return Ok(new { message = "Tạo phiếu xuất hóa chất thành công!", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Tạo phiếu xuất hóa chất thất bại!", error = ex.Message });
            }
        }

        [HttpPost("glue-butyl")]
        public async Task<IActionResult> CreateGlueButylSlip([FromBody] CreateInventorySlipDto dto)
        {
            try
            {
                if (!await _inventorySlipService.ValidateSlipCreationAsync(dto))
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ!" });
                }

                var result = await _inventorySlipService.CreateGlueButylSlipAsync(dto);
                return Ok(new { message = "Tạo phiếu xuất keo butyl thành công!", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Tạo phiếu xuất keo butyl thất bại!", error = ex.Message });
            }
        }

        [HttpPost("create-product")]
        public async Task<IActionResult> CreateProduct([FromBody] CreateInventoryProductDto dto)
        {
            try
            {
                var result = await _inventorySlipService.CreateProductAsync(dto);
                return Ok(new { message = "Tạo sản phẩm thành công!", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Tạo sản phẩm thất bại!", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInventorySlip(int id, [FromBody] CreateInventorySlipDto dto)
        {
            try
            {
                var result = await _inventorySlipService.UpdateInventorySlipAsync(id, dto);
                return Ok(new { message = "Cập nhật phiếu kho thành công!", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Cập nhật phiếu kho thất bại!", error = ex.Message });
            }
        }
    }
}
