using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.ProductionOrders.DTO;
using SEP490.Modules.ProductionOrders.Services;
using System.Diagnostics;
using System.IO;

namespace SEP490.Modules.ProductionOrders.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CutGlassInvoiceController : ControllerBase
    {
        private readonly ICutGlassInvoiceService _service;
        public CutGlassInvoiceController(ICutGlassInvoiceService service)
        {
            _service = service;
        }

        [HttpGet("by-production-order/{productionOrderId}")]
        public ActionResult<CutGlassInvoiceDetailDto> GetByProductionOrderId(int productionOrderId)
        {
            var result = _service.GetByProductionOrderId(productionOrderId);
            return Ok(result);
        }

        [HttpPost("test")]
        public IActionResult Test([FromBody] object request)
        {
            Debug.WriteLine("=== Test endpoint called ===");
            Debug.WriteLine($"Request type: {request?.GetType().Name}");
            Debug.WriteLine($"Request: {System.Text.Json.JsonSerializer.Serialize(request)}");
            return Ok(new { message = "Test successful" });
        }

        [HttpPost("test-dto")]
        public IActionResult TestDto([FromBody] SaveCutGlassInvoiceRequestDto request)
        {
            Debug.WriteLine("=== Test DTO endpoint called ===");
            if (request == null)
            {
                Debug.WriteLine("Request DTO is null!");
                return BadRequest(new { message = "Request DTO is null" });
            }
            
            Debug.WriteLine($"Request DTO: ProductionOrderId={request.productionOrderId}, Materials count={request.materials?.Count ?? 0}");
            return Ok(new { message = "Test DTO successful" });
        }

        [HttpPost]
        public IActionResult SaveCutGlassInvoice([FromBody] object rawRequest)
        {
            Debug.WriteLine("=== CutGlassInvoiceController.SaveCutGlassInvoice START ===");
            Debug.WriteLine($"Raw request type: {rawRequest?.GetType().Name}");
            Debug.WriteLine($"Raw request JSON: {System.Text.Json.JsonSerializer.Serialize(rawRequest)}");
            
            try
            {
                // Try to deserialize manually
                var jsonString = System.Text.Json.JsonSerializer.Serialize(rawRequest);
                var options = new System.Text.Json.JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };
                var request = System.Text.Json.JsonSerializer.Deserialize<SaveCutGlassInvoiceRequestDto>(jsonString, options);
                
                if (request == null)
                {
                    Debug.WriteLine("Failed to deserialize request!");
                    return BadRequest(new { success = false, message = "Failed to deserialize request" });
                }
                
                Debug.WriteLine($"Deserialized successfully: ProductionOrderId={request.productionOrderId}, Materials count={request.materials?.Count ?? 0}");
                
                if (request.materials != null)
                {
                    foreach (var material in request.materials)
                    {
                        Debug.WriteLine($"Material: Id={material.materialId}, Name={material.materialName}, Materials count={material.materials?.Count ?? 0}");
                        
                        if (material.materials != null)
                        {
                            foreach (var matItem in material.materials)
                            {
                                Debug.WriteLine($"  MaterialItem: Id={matItem.id}, Name={matItem.name}, Length={matItem.length}, Width={matItem.width}, Thickness={matItem.thickness}, Quantity={matItem.quantity}, Products={matItem.products?.Count ?? 0}, Wastes={matItem.wastes?.Count ?? 0}");
                            }
                        }
                    }
                }
                
                Debug.WriteLine("Calling service.SaveCutGlassInvoice...");
                try
                {
                    _service.SaveCutGlassInvoice(request);
                    Debug.WriteLine("Service call completed successfully");
                }
                catch (Exception serviceEx)
                {
                    Debug.WriteLine($"Service call failed: {serviceEx.Message}");
                    Debug.WriteLine($"Service exception type: {serviceEx.GetType().Name}");
                    throw;
                }
                return Ok(new { success = true, message = "Lưu phiếu cắt kính thành công" });
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error in SaveCutGlassInvoice: {ex.Message}");
                Debug.WriteLine($"Error type: {ex.GetType().Name}");
                Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                
                // Log inner exception if exists
                if (ex.InnerException != null)
                {
                    Debug.WriteLine($"Inner exception: {ex.InnerException.Message}");
                    Debug.WriteLine($"Inner exception type: {ex.InnerException.GetType().Name}");
                }
                
                return BadRequest(new { success = false, message = ex.Message });
            }
            finally
            {
                Debug.WriteLine("=== CutGlassInvoiceController.SaveCutGlassInvoice END ===");
            }
        }
    }
} 