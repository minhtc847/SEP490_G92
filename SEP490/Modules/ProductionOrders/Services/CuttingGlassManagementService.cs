using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class CuttingGlassManagementService : BaseService, ICuttingGlassManagementService
    {
        private readonly SEP490DbContext _context;
        public CuttingGlassManagementService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<List<Product>> GetThanhPhamProductsAsync()
        {
            return await _context.Products
                .Where(x => x.ProductType == "Thành phẩm")
                .ToListAsync();
        }

        public async Task<object> GetCuttingGlassSummaryAsync(int productionOrderId)
        {
            var outputs = await _context.ProductionOutputs
                .Where(x => x.ProductionOrderId == productionOrderId)
                .Include(x => x.Product)
                .ToListAsync();
            var materials = await _context.CutGlassInvoiceMaterials
                .Where(x => x.productionOrderId == productionOrderId)
                .Include(x => x.Product)
                .ToListAsync();
            var glassOutputs = await _context.CutGlassInvoiceOutputs
                .Where(x => x.IsDC == true &&
                    x.CutGlassInvoiceMaterial != null &&
                    x.CutGlassInvoiceMaterial.productionOrderId == productionOrderId)
                .Include(x => x.ProductionOutput)
                .ThenInclude(po => po.Product)
                .Include(x => x.CutGlassInvoiceMaterial)
                .ToListAsync();
            var banThanhPhamOutputs = await _context.CutGlassInvoiceOutputs
                .Where(x => x.IsDC == false && x.ProductionOutput.ProductionOrderId == productionOrderId)
                .Include(x => x.ProductionOutput)
                .ThenInclude(po => po.Product)
                .Include(x => x.CutGlassInvoiceMaterial)
                .ToListAsync();
            var glassOutputDtos = glassOutputs.Select(x => new {
                x.Id,
                x.ProductionOutputId,
                ProductName = x.ProductionOutput?.Product?.ProductName,
                x.Quantity,
                x.IsDC,
                x.Note,
                MaterialId = x.CutGlassInvoiceMaterialId,
                MaterialName = x.CutGlassInvoiceMaterial?.Product?.ProductName,
                x.CreatedAt,
                x.UpdatedAt
            }).ToList();
            var banThanhPhamDtos = banThanhPhamOutputs.Select(x => new {
                x.Id,
                x.ProductionOutputId,
                ProductName = x.ProductionOutput?.Product?.ProductName,
                x.Quantity,
                x.IsDC,
                x.Note,
                MaterialId = x.CutGlassInvoiceMaterialId,
                MaterialName = x.CutGlassInvoiceMaterial?.Product?.ProductName,
                x.CreatedAt,
                x.UpdatedAt
            }).ToList();
            return new {
                outputs = outputs.Select(x => new {
                    x.Id,
                    x.ProductId,
                    ProductName = x.Product?.ProductName,
                    x.UOM,
                    x.Amount
                }),
                materials = materials.Select(x => new {
                    x.Id,
                    x.productId,
                    ProductName = x.Product?.ProductName,
                    x.quantity,
                    x.note,
                    x.CreatedAt,
                    x.UpdatedAt
                }),
                glassOutputs = ((IEnumerable<object>)glassOutputDtos).Concat(banThanhPhamDtos).ToList()
            };
        }

        public async Task<Product> CreateProductAsync(CreateProductionProductDto dto)
        {
            var product = new Product
            {
                ProductCode = dto.ProductCode,
                ProductName = dto.ProductName,
                ProductType = "Thành phẩm",
                UOM = dto.UOM
            };
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<ProductionOutput> CreateProductionOutputAsync(CreateProductionOutputDto dto)
        {
            var output = new ProductionOutput
            {
                ProductId = dto.ProductId,
                Amount = dto.Amount,
                ProductionOrderId = dto.ProductionOrderId
            };
            _context.ProductionOutputs.Add(output);
            await _context.SaveChangesAsync();
            return output;
        }

        public async Task<CutGlassInvoiceMaterial> CreateMaterialAsync(CutGlassInvoiceMaterial material)
        {
            material.CreatedAt = DateTime.Now;
            material.UpdatedAt = DateTime.Now;
            _context.CutGlassInvoiceMaterials.Add(material);
            await _context.SaveChangesAsync();
            return material;
        }

        public async Task<CutGlassInvoiceOutput> CreateCutGlassOutputAsync(CutGlassInvoiceOutputCreateDto dto)
        {
            var output = new CutGlassInvoiceOutput
            {
                CutGlassInvoiceMaterialId = dto.CutGlassInvoiceMaterialId,
                ProductionOutputId = dto.ProductionOutputId,
                Quantity = (int)dto.Quantity,
                IsDC = dto.IsDC,
                Note = dto.Note,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            };
            _context.CutGlassInvoiceOutputs.Add(output);
            await _context.SaveChangesAsync();

            // Nếu là bán thành phẩm (isDC == false), cập nhật ProductionOutput.done
            if (!dto.IsDC)
            {
                // Lấy tổng quantity của tất cả CutGlassInvoiceOutput (isDC=false) cùng ProductionOutputId
                var totalDone = await _context.CutGlassInvoiceOutputs
                    .Where(x => x.ProductionOutputId == dto.ProductionOutputId && x.IsDC == false)
                    .SumAsync(x => (int?)x.Quantity) ?? 0;
                var prodOutput = await _context.ProductionOutputs.FindAsync(dto.ProductionOutputId);
                if (prodOutput != null)
                {
                    prodOutput.Finished = totalDone;
                    await _context.SaveChangesAsync();

                    // Kiểm tra tất cả các ProductionOutput của ProductionOrder
                    if (prodOutput.ProductionOrderId.HasValue)
                    {
                        var prodOrderId = prodOutput.ProductionOrderId.Value;
                        var allOutputs = await _context.ProductionOutputs
                            .Where(po => po.ProductionOrderId == prodOrderId)
                            .ToListAsync();

                        bool allDone = allOutputs.All(po =>
                            po.Amount.HasValue && po.Finished.HasValue && po.Amount.Value <= po.Finished.Value && po.Amount.Value > 0
                        );

                        var prodOrder = await _context.ProductionOrders.FindAsync(prodOrderId);
                        if (prodOrder != null)
                        {
                            if (allDone)
                            {
                                prodOrder.Status = ProductionStatus.Completed;
                            }
                            else
                            {
                                prodOrder.Status = ProductionStatus.Completed;
                            }
                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }
            return output;
        }

        public async Task<CutGlassInvoiceMaterial> UpdateMaterialAsync(int id, UpdateMaterialDto dto)
        {
            var material = await _context.CutGlassInvoiceMaterials.FindAsync(id);
            if (material == null)
            {
                throw new Exception($"Material with ID {id} not found");
            }
            material.quantity = dto.Quantity;
            material.note = dto.Note;
            material.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();
            return material;
        }

        public async Task<CutGlassInvoiceOutput> UpdateCutGlassOutputAsync(int id, UpdateCutGlassOutputDto dto)
        {
            var output = await _context.CutGlassInvoiceOutputs.FindAsync(id);
            if (output == null)
            {
                throw new Exception($"Cut glass output with ID {id} not found");
            }
            output.Quantity = dto.Quantity;
            output.Note = dto.Note;
            output.UpdatedAt = DateTime.Now;
            await _context.SaveChangesAsync();

            // Nếu là bán thành phẩm (isDC == false), cập nhật ProductionOutput.done
            if (!output.IsDC)
            {
                var totalDone = await _context.CutGlassInvoiceOutputs
                    .Where(x => x.ProductionOutputId == output.ProductionOutputId && x.IsDC == false)
                    .SumAsync(x => (int?)x.Quantity) ?? 0;
                var prodOutput = await _context.ProductionOutputs.FindAsync(output.ProductionOutputId);
                if (prodOutput != null)
                {
                    prodOutput.Finished = totalDone;
                    await _context.SaveChangesAsync();

                    // Kiểm tra tất cả các ProductionOutput của ProductionOrder
                    if (prodOutput.ProductionOrderId.HasValue)
                    {
                        var prodOrderId = prodOutput.ProductionOrderId.Value;
                        var allOutputs = await _context.ProductionOutputs
                            .Where(po => po.ProductionOrderId == prodOrderId)
                            .ToListAsync();

                        bool allDone = allOutputs.All(po =>
                            po.Amount.HasValue && po.Finished.HasValue && po.Amount.Value <= po.Finished.Value && po.Amount.Value > 0
                        );

                        var prodOrder = await _context.ProductionOrders.FindAsync(prodOrderId);
                        if (prodOrder != null)
                        {
                            if (allDone)
                            {
                                prodOrder.Status = ProductionStatus.Completed;
                            }
                            else
                            {
                                prodOrder.Status = ProductionStatus.Completed;
                            }
                            await _context.SaveChangesAsync();
                        }
                    }
                }
            }
            return output;
        }

        public async Task DeleteMaterialAsync(int id)
        {
            var material = await _context.CutGlassInvoiceMaterials.FindAsync(id);
            if (material == null)
            {
                throw new Exception($"Material with ID {id} not found");
            }
            _context.CutGlassInvoiceMaterials.Remove(material);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteCutGlassOutputAsync(int id)
        {
            var output = await _context.CutGlassInvoiceOutputs.FindAsync(id);
            if (output == null)
            {
                throw new Exception($"Cut glass output with ID {id} not found");
            }
            _context.CutGlassInvoiceOutputs.Remove(output);
            await _context.SaveChangesAsync();
        }
    }
} 