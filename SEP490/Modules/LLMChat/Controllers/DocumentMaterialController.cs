using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.LLMChat.Services;
using SEP490.DB.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SEP490.Modules.LLMChat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentMaterialController : ControllerBase
    {
        private readonly IDocumentMaterialService _documentService;

        public DocumentMaterialController(IDocumentMaterialService documentService)
        {
            _documentService = documentService;
        }

        [HttpGet]
        public async Task<ActionResult<List<DocumentMaterial>>> GetAll()
        {
            try
            {
                var documents = await _documentService.GetAllAsync();
                return Ok(documents);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentMaterial>> GetById(int id)
        {
            try
            {
                var document = await _documentService.GetByIdAsync(id);
                if (document == null)
                    return NotFound(new { message = "Document not found" });

                return Ok(document);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<DocumentMaterial>> Create([FromBody] DocumentMaterial document)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(document.Name))
                    return BadRequest(new { message = "Name is required" });

                if (string.IsNullOrWhiteSpace(document.Content))
                    return BadRequest(new { message = "Content is required" });

                var createdDocument = await _documentService.CreateAsync(document);
                return CreatedAtAction(nameof(GetById), new { id = createdDocument.Id }, createdDocument);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<DocumentMaterial>> Update(int id, [FromBody] DocumentMaterial document)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(document.Name))
                    return BadRequest(new { message = "Name is required" });

                if (string.IsNullOrWhiteSpace(document.Content))
                    return BadRequest(new { message = "Content is required" });

                var updatedDocument = await _documentService.UpdateAsync(id, document);
                return Ok(updatedDocument);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _documentService.DeleteAsync(id);
                if (!result)
                    return NotFound(new { message = "Document not found" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPatch("{id}/status")]
        public async Task<ActionResult<DocumentMaterial>> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Status))
                    return BadRequest(new { message = "Status is required" });

                var updatedDocument = await _documentService.UpdateStatusAsync(id, request.Status);
                return Ok(updatedDocument);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPatch("{id}/chunk-count")]
        public async Task<ActionResult<DocumentMaterial>> UpdateChunkCount(int id, [FromBody] UpdateChunkCountRequest request)
        {
            try
            {
                if (request.ChunkCount < 0)
                    return BadRequest(new { message = "Chunk count must be non-negative" });

                var updatedDocument = await _documentService.UpdateChunkCountAsync(id, request.ChunkCount);
                return Ok(updatedDocument);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }

    public class UpdateStatusRequest
    {
        public string Status { get; set; } = string.Empty;
    }

    public class UpdateChunkCountRequest
    {
        public int ChunkCount { get; set; }
    }
} 