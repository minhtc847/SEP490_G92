using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.MaterialModule.DTO;
using SEP490.Modules.MaterialModule.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SEP490.Modules.MaterialModule.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MaterialController : ControllerBase
    {
        private readonly IMaterialService _materialService;

        public MaterialController(IMaterialService materialService)
        {
            _materialService = materialService;
        }

        [HttpGet]
        public async Task<ActionResult<List<MaterialChatbotResponseDTO>>> GetAllMaterials()
        {
            try
            {
                var materials = await _materialService.GetAllMaterialsAsync();
                return Ok(materials);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<MaterialChatbotResponseDTO>> GetMaterial(int id)
        {
            try
            {
                var material = await _materialService.GetMaterialByIdAsync(id);
                if (material == null)
                    return NotFound(new { message = "Material not found" });

                return Ok(material);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<MaterialChatbotResponseDTO>> CreateMaterial([FromBody] CreateMaterialChatbotDTO createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var material = await _materialService.CreateMaterialAsync(createDto);
                return CreatedAtAction(nameof(GetMaterial), new { id = material.Id }, material);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MaterialChatbotResponseDTO>> UpdateMaterial(int id, [FromBody] UpdateMaterialChatbotDTO updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var material = await _materialService.UpdateMaterialAsync(id, updateDto);
                if (material == null)
                    return NotFound(new { message = "Material not found" });

                return Ok(material);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMaterial(int id)
        {
            try
            {
                var success = await _materialService.DeleteMaterialAsync(id);
                if (!success)
                    return NotFound(new { message = "Material not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost("{id}/sync")]
        public async Task<ActionResult> SyncMaterial(int id)
        {
            try
            {
                var success = await _materialService.SyncMaterialAsync(id);
                if (!success)
                    return NotFound(new { message = "Material not found" });

                return Ok(new { message = "Material sync started" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}