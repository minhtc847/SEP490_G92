using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ChemicalExportModule.DTO;

namespace SEP490.Modules.ChemicalExportModule.Service
{
    public class ChemicalExportService : BaseTransientService, IChemicalExportService
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

                    // Update finished quantity in ProductionOutput
                    var productionOutput = await _context.ProductionOutputs
                        .FirstOrDefaultAsync(po => po.ProductId == product.ProductId && po.ProductionOrderId == dto.ProductionOrderId);

                    if (productionOutput != null)
                    {
                        productionOutput.Finished = (productionOutput.Finished ?? 0) + (int)product.Quantity;
                        _context.ProductionOutputs.Update(productionOutput);
                    }

                    // Check if this is a glue pouring order and update ProductionPlanDetail.Done
                    var productionOrder = await _context.ProductionOrders
                        .Include(po => po.ProductionPlan)
                        .FirstOrDefaultAsync(po => po.Id == dto.ProductionOrderId);

                    if (productionOrder != null && productionOrder.Type == "Đổ keo")
                    {
                        // Update ProductionPlanDetail.Done for the corresponding product
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

                // Check if production order should be completed
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
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var chemicalExport = await _context.ChemicalExports
                    .Include(ce => ce.ChemicalExportDetails)
                    .FirstOrDefaultAsync(ce => ce.Id == id);

                if (chemicalExport == null)
                    return false;

                // Decrease finished quantity in ProductionOutput
                var productionOutput = await _context.ProductionOutputs
                    .FirstOrDefaultAsync(po => po.ProductId == chemicalExport.ProductId && po.ProductionOrderId == chemicalExport.ProductionOrderId);

                if (productionOutput != null)
                {
                    productionOutput.Finished = Math.Max(0, (productionOutput.Finished ?? 0) - (int)chemicalExport.Quantity);
                    _context.ProductionOutputs.Update(productionOutput);
                }

                // Check if this is a glue pouring order and decrease ProductionPlanDetail.Done
                var productionOrder = await _context.ProductionOrders
                    .Include(po => po.ProductionPlan)
                    .FirstOrDefaultAsync(po => po.Id == chemicalExport.ProductionOrderId);

                if (productionOrder != null && productionOrder.Type == "Đổ keo")
                {
                    // Decrease ProductionPlanDetail.Done for the corresponding product
                    var productionPlanDetail = await _context.ProductionPlanDetails
                        .FirstOrDefaultAsync(ppd => ppd.ProductionPlanId == productionOrder.ProductionPlanId && ppd.ProductId == chemicalExport.ProductId);

                    if (productionPlanDetail != null)
                    {
                        productionPlanDetail.Done = Math.Max(0, productionPlanDetail.Done - (int)chemicalExport.Quantity);
                        _context.ProductionPlanDetails.Update(productionPlanDetail);
                    }
                }

                // Remove details first
                _context.ChemicalExportDetails.RemoveRange(chemicalExport.ChemicalExportDetails);
                
                // Remove main record
                _context.ChemicalExports.Remove(chemicalExport);
                
                await _context.SaveChangesAsync();

                // Check if production order status needs to be updated
                if (chemicalExport.ProductionOrderId.HasValue)
                {
                    await CheckAndUpdateProductionOrderStatusAsync(chemicalExport.ProductionOrderId.Value);
                }

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> CheckAndUpdateProductionOrderStatusAsync(int productionOrderId)
        {
            // Get all production outputs for this production order
            var productionOutputs = await _context.ProductionOutputs
                .Where(po => po.ProductionOrderId == productionOrderId)
                .ToListAsync();

            // Check if all outputs have finished >= amount
            bool allCompleted = productionOutputs.All(po => 
                (po.Finished ?? 0) >= (po.Amount ?? 0));

            if (allCompleted)
            {
                // Update production order status to Completed
                var productionOrder = await _context.ProductionOrders
                    .FirstOrDefaultAsync(po => po.Id == productionOrderId);

                if (productionOrder != null)
                {
                    productionOrder.Status = ProductionStatus.Completed;
                    _context.ProductionOrders.Update(productionOrder);
                    await _context.SaveChangesAsync();
                    return true; // Status was updated
                }
            }

            return false; // Status was not updated
        }

        public async Task<bool> UpdateProductionPlanDetailDoneAsync(int productionOrderId, int productId, int quantity, bool isIncrease)
        {
            try
            {
                // Get the production order to check if it's a glue pouring order
                var productionOrder = await _context.ProductionOrders
                    .Include(po => po.ProductionPlan)
                    .FirstOrDefaultAsync(po => po.Id == productionOrderId);

                if (productionOrder == null || productionOrder.Type != "Đổ keo")
                {
                    return false; // Not a glue pouring order or order not found
                }

                // Find the corresponding ProductionPlanDetail
                var productionPlanDetail = await _context.ProductionPlanDetails
                    .FirstOrDefaultAsync(ppd => ppd.ProductionPlanId == productionOrder.ProductionPlanId && ppd.ProductId == productId);

                if (productionPlanDetail == null)
                {
                    return false; // ProductionPlanDetail not found
                }

                // Update the Done quantity
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