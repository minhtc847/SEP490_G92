using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using SEP490.Modules.InventorySlipModule.DTO;
using SEP490.Modules.InventorySlipModule.Service;
using System;
using System.Threading.Tasks;

namespace SEP490.Modules.InventorySlipModule.Controller
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInventorySlip(int id, [FromBody] object requestData)
        {
            try
            {
                var jsonElement = (System.Text.Json.JsonElement)requestData;
                var options = new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true, PropertyNamingPolicy = null };

                CreateInventorySlipDto dto = null;
                MappingInfoDto mappingInfo = null;

                if (jsonElement.TryGetProperty("formData", out var formDataElement))
                {
                    dto = System.Text.Json.JsonSerializer.Deserialize<CreateInventorySlipDto>(formDataElement.GetRawText(), options);
                }
                else
                {
                    dto = System.Text.Json.JsonSerializer.Deserialize<CreateInventorySlipDto>(jsonElement.GetRawText(), options);
                }

                if (jsonElement.TryGetProperty("productClassifications", out var productClassificationsElement))
                {
                    var productClassifications = System.Text.Json.JsonSerializer.Deserialize<List<ProductClassificationDto>>(productClassificationsElement.GetRawText(), options);
                    List<CreateMaterialOutputMappingDto> tempMappings = null;
                    if (jsonElement.TryGetProperty("tempMappings", out var tempMappingsElement))
                    {
                        tempMappings = System.Text.Json.JsonSerializer.Deserialize<List<CreateMaterialOutputMappingDto>>(tempMappingsElement.GetRawText(), options);
                    }
                    mappingInfo = new MappingInfoDto
                    {
                        ProductClassifications = productClassifications,
                        TempMappings = tempMappings ?? new List<CreateMaterialOutputMappingDto>()
                    };
                }

                if (dto == null) return BadRequest(new { message = "Dữ liệu không hợp lệ!" });

                var result = await _inventorySlipService.UpdateInventorySlipAsync(id, dto, mappingInfo);
                return Ok(new { message = "Cập nhật phiếu kho thành công!", data = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Cập nhật phiếu kho thất bại!", error = ex.Message });
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

        [HttpPut("{id}/finalize")]
        public async Task<IActionResult> FinalizeInventorySlip(int id)
        {
            try
            {
                var ok = await _inventorySlipService.FinalizeInventorySlipAsync(id);
                if (!ok)
                {
                    return NotFound(new { message = "Không tìm thấy phiếu hoặc không thể hoàn tất." });
                }
                return Ok(new { message = "Đã cập nhật số lượng thành phẩm và khóa phiếu." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Lỗi khi hoàn tất phiếu!", error = ex.Message });
            }
        }

        [HttpPost("cut-glass")]
        public async Task<IActionResult> CreateCutGlassSlip([FromBody] object requestData)
        {
            try
            {                
                var jsonElement = (System.Text.Json.JsonElement)requestData;
                
                CreateInventorySlipDto dto;
                if (jsonElement.TryGetProperty("formData", out var formDataElement))
                {
                    var options = new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        PropertyNamingPolicy = null
                    };
                    
                    dto = System.Text.Json.JsonSerializer.Deserialize<CreateInventorySlipDto>(formDataElement.GetRawText(), options);
                    
                    // If deserialization fails, fall back to manual construction
                    if (dto == null || dto.ProductionOrderId == 0 || dto.Details?.Count == 0)
                    {
                        // Deserialize the formData element as a generic object
                        var formDataRaw = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(formDataElement.GetRawText());
                        if (formDataRaw != null)
                        {
                            dto = new CreateInventorySlipDto
                            {
                                ProductionOrderId = Convert.ToInt32(formDataRaw["productionOrderId"].ToString()),
                                Description = formDataRaw["description"]?.ToString() ?? "",
                                Details = System.Text.Json.JsonSerializer.Deserialize<List<CreateInventorySlipDetailDto>>(
                                    formDataRaw["details"].ToString(), options),
                                Mappings = formDataRaw.ContainsKey("mappings") && formDataRaw["mappings"] != null
                                    ? System.Text.Json.JsonSerializer.Deserialize<List<CreateMaterialOutputMappingDto>>(
                                        formDataRaw["mappings"].ToString(), options)
                                    : new List<CreateMaterialOutputMappingDto>()
                            };
                        }
                    }
                }
                else
                {
                    var rawData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(jsonElement.GetRawText());
                    if (rawData != null)
                    {
                        var fullJson = jsonElement.GetRawText();
                        
                        var options = new System.Text.Json.JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true,
                            PropertyNamingPolicy = null
                        };
                        
                        dto = System.Text.Json.JsonSerializer.Deserialize<CreateInventorySlipDto>(fullJson, options);
                        
                        if (dto == null || dto.ProductionOrderId == 0 || dto.Details?.Count == 0)
                        {
                            // Fallback to manual construction if direct deserialization fails
                            dto = new CreateInventorySlipDto
                            {
                                ProductionOrderId = Convert.ToInt32(rawData["productionOrderId"].ToString()),
                                Description = rawData["description"]?.ToString() ?? "",
                                Details = System.Text.Json.JsonSerializer.Deserialize<List<CreateInventorySlipDetailDto>>(
                                    rawData["details"].ToString(), options),
                                Mappings = rawData.ContainsKey("mappings") && rawData["mappings"] != null
                                    ? System.Text.Json.JsonSerializer.Deserialize<List<CreateMaterialOutputMappingDto>>(
                                        rawData["mappings"].ToString(), options)
                                    : new List<CreateMaterialOutputMappingDto>()
                            };
                        }
                    }
                    else
                    {
                        dto = null;
                    }
                }

                if (dto == null)
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ - DTO null!" });
                }

                if (!await _inventorySlipService.ValidateSlipCreationAsync(dto))
                {
                    return BadRequest(new { message = "Dữ liệu không hợp lệ!" });
                }

                // Extract mappingInfo from productClassifications and tempMappings
                MappingInfoDto mappingInfo = null;
                
                // Check if productClassifications exists directly in request body
                if (jsonElement.TryGetProperty("productClassifications", out var productClassificationsElement))
                {
                    Console.WriteLine("Found productClassifications property directly in request");
                    
                    var mappingOptions = new System.Text.Json.JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true,
                        PropertyNamingPolicy = null
                    };
                    
                    var productClassifications = System.Text.Json.JsonSerializer.Deserialize<List<ProductClassificationDto>>(
                        productClassificationsElement.GetRawText(), mappingOptions);
                    
                    // Check if tempMappings exists
                    List<CreateMaterialOutputMappingDto> tempMappings = null;
                    if (jsonElement.TryGetProperty("tempMappings", out var tempMappingsElement))
                    {
                        tempMappings = System.Text.Json.JsonSerializer.Deserialize<List<CreateMaterialOutputMappingDto>>(
                            tempMappingsElement.GetRawText(), mappingOptions);
                    }
                    
                    // Create mappingInfo from the extracted data
                    mappingInfo = new MappingInfoDto
                    {
                        ProductClassifications = productClassifications,
                        TempMappings = tempMappings ?? new List<CreateMaterialOutputMappingDto>()
                    };                   
                }
                else
                {
                    Console.WriteLine("No productClassifications property found in request");
                }

                var result = await _inventorySlipService.CreateCutGlassSlipAsync(dto, mappingInfo);
                
                return Ok(new { message = "Tạo phiếu cắt kính thành công!", data = result });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in CreateCutGlassSlip: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
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
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        
        [HttpPost("products/search")]
        public async Task<IActionResult> SearchProducts([FromBody] ProductSearchRequestDto request)
        {
            try
            {
                var result = await _inventorySlipService.GetPaginatedProductsAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("materials/production-output/{productionOutputId}")]
        public async Task<IActionResult> GetMaterialsByProductionOutput(int productionOutputId)
        {
            try
            {
                var result = await _inventorySlipService.GetMaterialsByProductionOutputAsync(productionOutputId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }



    }
}
