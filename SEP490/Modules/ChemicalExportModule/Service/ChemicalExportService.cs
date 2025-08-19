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

                    var productionOutput = await _context.ProductionOutputs
                        .FirstOrDefaultAsync(po => po.ProductId == product.ProductId && po.ProductionOrderId == dto.ProductionOrderId);

                    if (productionOutput != null)
                    {
                        productionOutput.Finished = (productionOutput.Finished ?? 0m) + product.Quantity;
                        _context.ProductionOutputs.Update(productionOutput);
                    }

                    var productionOrder = await _context.ProductionOrders
                        .Include(po => po.ProductionPlan)
                        .FirstOrDefaultAsync(po => po.Id == dto.ProductionOrderId);

                    if (productionOrder != null && productionOrder.Type == "Đổ keo")
                    {
                        var productionPlanDetail = await _context.ProductionPlanDetails
                            .FirstOrDefaultAsync(ppd => ppd.ProductionPlanId == productionOrder.ProductionPlanId && ppd.ProductId == product.ProductId);

                        if (productionPlanDetail != null)
                        {
                            productionPlanDetail.Done = productionPlanDetail.Done + (int)product.Quantity;
                            _context.ProductionPlanDetails.Update(productionPlanDetail);
                        }
                    }

                    chemicalExports.Add(chemicalExport);
                }

                await _context.SaveChangesAsync();
                await CheckAndUpdateProductionOrderStatusAsync(dto.ProductionOrderId);

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
                UOM = po.Product != null ? po.Product.UOM : null,
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

        public async Task<bool> CheckAndUpdateProductionOrderStatusAsync(int productionOrderId)
        {
            try
            {
                var productionOutputs = await _context.ProductionOutputs
                    .Where(po => po.ProductionOrderId == productionOrderId)
                    .ToListAsync();

                if (!productionOutputs.Any())
                {
                    return false; 
                }
                
                // Check if all outputs have finished >= amount
                bool allCompleted = true;
                foreach (var po in productionOutputs)
                {
                    var finished = po.Finished ?? 0m;
                    var amount = po.Amount ?? 0m;
                    var isCompleted = finished >= amount;
                    if (!isCompleted)
                    {
                        allCompleted = false;
                    }
                }

                if (allCompleted)
                {
                    var productionOrder = await _context.ProductionOrders
                        .FirstOrDefaultAsync(po => po.Id == productionOrderId);

                    if (productionOrder != null)
                    {
                        productionOrder.Status = ProductionStatus.Completed;
                        _context.ProductionOrders.Update(productionOrder);
                        await _context.SaveChangesAsync();
                        return true; 
                    }
                }

                return false; 
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> UpdateProductionPlanDetailDoneAsync(int productionOrderId, int productId, int quantity, bool isIncrease)
        {
            try
            {
                var productionOrder = await _context.ProductionOrders
                    .Include(po => po.ProductionPlan)
                    .FirstOrDefaultAsync(po => po.Id == productionOrderId);

                if (productionOrder == null || productionOrder.Type != "Đổ keo")
                {
                    return false; 
                }

                var productionPlanDetail = await _context.ProductionPlanDetails
                    .FirstOrDefaultAsync(ppd => ppd.ProductionPlanId == productionOrder.ProductionPlanId && ppd.ProductId == productId);

                if (productionPlanDetail == null)
                {
                    return false;
                }

                if (isIncrease)
                {
                    productionPlanDetail.Done = productionPlanDetail.Done + quantity;
                }
                else
                {
                    productionPlanDetail.Done = Math.Max(0, productionPlanDetail.Done - quantity);
                }

                _context.ProductionPlanDetails.Update(productionPlanDetail);
                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
} 