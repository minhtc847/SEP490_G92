using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ChemicalExportModule.DTO;

namespace SEP490.Modules.ChemicalExportModule.Service
{
    public class ChemicalExportService : BaseService, IChemicalExportService
    {
        private readonly SEP490DbContext _context;

        public ChemicalExportService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<ChemicalExportDto> CreateChemicalExportAsync(CreateChemicalExportDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var chemicalExports = new List<ChemicalExport>();

                foreach (var product in dto.Products)
                {
                    // Create main chemical export record
                    var chemicalExport = new ChemicalExport
                    {
                        ProductId = product.ProductId,
                        Quantity = product.Quantity,
                        UOM = product.UOM,
                        Note = dto.Note,
                        ProductionOrderId = dto.ProductionOrderId
                    };

                    _context.ChemicalExports.Add(chemicalExport);
                    await _context.SaveChangesAsync();

                    // Create detail records for materials
                    foreach (var material in product.Materials)
                    {
                        var detail = new ChemicalExportDetail
                        {
                            ProductId = material.ProductId,
                            Quantity = material.Quantity,
                            UOM = material.UOM,
                            Note = material.ProductName,
                            ChemicalExportId = chemicalExport.Id
                        };

                        _context.ChemicalExportDetails.Add(detail);
                    }

                    chemicalExports.Add(chemicalExport);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Return the first chemical export with details
                var result = await GetChemicalExportByIdAsync(chemicalExports.First().Id);
                return result;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<ChemicalExportDto> GetChemicalExportByIdAsync(int id)
        {
            var chemicalExport = await _context.ChemicalExports
                .Include(ce => ce.Product)
                .Include(ce => ce.ProductionOrder)
                .Include(ce => ce.ChemicalExportDetails)
                .ThenInclude(ced => ced.Product)
                .FirstOrDefaultAsync(ce => ce.Id == id);

            if (chemicalExport == null)
                return null;

            return new ChemicalExportDto
            {
                Id = chemicalExport.Id,
                ProductId = chemicalExport.ProductId,
                ProductName = chemicalExport.Product != null ? chemicalExport.Product.ProductName : null,
                Quantity = chemicalExport.Quantity,
                UOM = chemicalExport.UOM,
                Note = chemicalExport.Note,
                ProductionOrderId = chemicalExport.ProductionOrderId,
                CreatedAt = chemicalExport.CreatedAt,
                Details = chemicalExport.ChemicalExportDetails != null ? chemicalExport.ChemicalExportDetails.Select(ced => new ChemicalExportDetailDto
                {
                    Id = ced.Id,
                    ProductId = ced.ProductId,
                    ProductName = ced.Product != null ? ced.Product.ProductName : null,
                    Quantity = ced.Quantity,
                    UOM = ced.UOM,
                    Note = ced.Note,
                    ChemicalExportId = ced.ChemicalExportId
                }).ToList() : new List<ChemicalExportDetailDto>()
            };
        }

        public async Task<List<ChemicalExportDto>> GetChemicalExportsByProductionOrderAsync(int productionOrderId)
        {
            var chemicalExports = await _context.ChemicalExports
                .Include(ce => ce.Product)
                .Include(ce => ce.ChemicalExportDetails)
                .ThenInclude(ced => ced.Product)
                .Where(ce => ce.ProductionOrderId == productionOrderId)
                .ToListAsync();

            return chemicalExports.Select(ce => new ChemicalExportDto
            {
                Id = ce.Id,
                ProductId = ce.ProductId,
                ProductName = ce.Product != null ? ce.Product.ProductName : null,
                Quantity = ce.Quantity,
                UOM = ce.UOM,
                Note = ce.Note,
                ProductionOrderId = ce.ProductionOrderId,
                CreatedAt = ce.CreatedAt,
                Details = ce.ChemicalExportDetails != null ? ce.ChemicalExportDetails.Select(ced => new ChemicalExportDetailDto
                {
                    Id = ced.Id,
                    ProductId = ced.ProductId,
                    ProductName = ced.Product != null ? ced.Product.ProductName : null,
                    Quantity = ced.Quantity,
                    UOM = ced.UOM,
                    Note = ced.Note,
                    ChemicalExportId = ced.ChemicalExportId
                }).ToList() : new List<ChemicalExportDetailDto>()
            }).ToList();
        }

        public async Task<List<ChemicalExportDto>> GetAllChemicalExportsAsync()
        {
            var chemicalExports = await _context.ChemicalExports
                .Include(ce => ce.Product)
                .Include(ce => ce.ChemicalExportDetails)
                .ThenInclude(ced => ced.Product)
                .ToListAsync();

            return chemicalExports.Select(ce => new ChemicalExportDto
            {
                Id = ce.Id,
                ProductId = ce.ProductId,
                ProductName = ce.Product != null ? ce.Product.ProductName : null,
                Quantity = ce.Quantity,
                UOM = ce.UOM,
                Note = ce.Note,
                ProductionOrderId = ce.ProductionOrderId,
                CreatedAt = ce.CreatedAt,
                Details = ce.ChemicalExportDetails != null ? ce.ChemicalExportDetails.Select(ced => new ChemicalExportDetailDto
                {
                    Id = ced.Id,
                    ProductId = ced.ProductId,
                    ProductName = ced.Product != null ? ced.Product.ProductName : null,
                    Quantity = ced.Quantity,
                    UOM = ced.UOM,
                    Note = ced.Note,
                    ChemicalExportId = ced.ChemicalExportId
                }).ToList() : new List<ChemicalExportDetailDto>()
            }).ToList();
        }

        public async Task<ProductionOrderProductsDto> GetProductionOrderProductsAsync(int productionOrderId)
        {
            var outputs = await _context.ProductionOutputs
                .Include(po => po.Product)
                .Where(po => po.ProductionOrderId == productionOrderId)
                .ToListAsync();

            var outputDtos = outputs.Select(po => new ProductionOutputDto
            {
                Id = po.Id,
                ProductId = po.ProductId,
                ProductName = po.ProductName ?? po.Product.ProductName,
                UOM = po.UOM.ToString(),
                Amount = po.Amount,
                Finished = po.Finished,
                Defected = po.Defected
            }).ToList();

            var materials = await _context.ProductionMaterials
                .Include(pm => pm.Product)
                .Include(pm => pm.ProductionOutput)
                .Where(pm => pm.ProductionOutput.ProductionOrderId == productionOrderId)
                .ToListAsync();

            var materialDtos = materials.Select(pm => new ProductionMaterialDto
            {
                Id = pm.Id,
                ProductId = pm.ProductId,
                ProductName = pm.Product.ProductName,
                UOM = pm.UOM.ToString(),
                Amount = pm.Amount,
                ProductionOutputId = pm.ProductionOutputId
            }).ToList();

            return new ProductionOrderProductsDto
            {
                ProductionOrderId = productionOrderId,
                Outputs = outputDtos,
                Materials = materialDtos
            };
        }

        public async Task<bool> DeleteChemicalExportAsync(int id)
        {
            var chemicalExport = await _context.ChemicalExports
                .Include(ce => ce.ChemicalExportDetails)
                .FirstOrDefaultAsync(ce => ce.Id == id);

            if (chemicalExport == null)
                return false;

            // Remove details first
            _context.ChemicalExportDetails.RemoveRange(chemicalExport.ChemicalExportDetails);
            
            // Remove main record
            _context.ChemicalExports.Remove(chemicalExport);
            
            await _context.SaveChangesAsync();
            return true;
        }
    }
} 