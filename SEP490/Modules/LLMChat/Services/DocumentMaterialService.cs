using SEP490.DB.Models;
using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SEP490.DB;
using SEP490.DB.Models;

namespace SEP490.Modules.LLMChat.Services
{
    public interface IDocumentMaterialService
    {
        Task<List<DocumentMaterial>> GetAllAsync();
        Task<DocumentMaterial?> GetByIdAsync(int id);
        Task<DocumentMaterial> CreateAsync(DocumentMaterial document);
        Task<DocumentMaterial> UpdateAsync(int id, DocumentMaterial document);
        Task<bool> DeleteAsync(int id);
        Task<DocumentMaterial> UpdateStatusAsync(int id, string status);
        Task<DocumentMaterial> UpdateChunkCountAsync(int id, int chunkCount);
    }

    public class DocumentMaterialService : BaseScopedService, IDocumentMaterialService
    {
        private readonly SEP490DbContext _context;

        public DocumentMaterialService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<List<DocumentMaterial>> GetAllAsync()
        {
            return await _context.DocumentMaterials
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();
        }

        public async Task<DocumentMaterial?> GetByIdAsync(int id)
        {
            return await _context.DocumentMaterials.FindAsync(id);
        }

        public async Task<DocumentMaterial> CreateAsync(DocumentMaterial document)
        {
            document.CreatedAt = DateTime.UtcNow;
            document.Status = "pending";
            document.ChunkCount = 0;

            _context.DocumentMaterials.Add(document);
            await _context.SaveChangesAsync();
            return document;
        }

        public async Task<DocumentMaterial> UpdateAsync(int id, DocumentMaterial document)
        {
            var existingDocument = await _context.DocumentMaterials.FindAsync(id);
            if (existingDocument == null)
                throw new ArgumentException("Document not found");

            existingDocument.Name = document.Name;
            existingDocument.Description = document.Description;
            existingDocument.Content = document.Content;
            existingDocument.FilePath = document.FilePath;

            await _context.SaveChangesAsync();
            return existingDocument;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var document = await _context.DocumentMaterials.FindAsync(id);
            if (document == null)
                return false;

            _context.DocumentMaterials.Remove(document);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<DocumentMaterial> UpdateStatusAsync(int id, string status)
        {
            var document = await _context.DocumentMaterials.FindAsync(id);
            if (document == null)
                throw new ArgumentException("Document not found");

            document.Status = status;
            await _context.SaveChangesAsync();
            return document;
        }

        public async Task<DocumentMaterial> UpdateChunkCountAsync(int id, int chunkCount)
        {
            var document = await _context.DocumentMaterials.FindAsync(id);
            if (document == null)
                throw new ArgumentException("Document not found");

            document.ChunkCount = chunkCount;
            await _context.SaveChangesAsync();
            return document;
        }
    }
} 