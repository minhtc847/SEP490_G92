using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.InventorySlipModule.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace SEP490.Modules.InventorySlipModule.Service
{
    public class InventorySlipService : BaseScopedService, IInventorySlipService
    {
        private readonly SEP490DbContext _context;

        public InventorySlipService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<InventorySlipDto> CreateInventorySlipAsync(CreateInventorySlipDto dto)
        {
            var productionOrder = await _context.ProductionOrders
                .FirstOrDefaultAsync(po => po.Id == dto.ProductionOrderId);
            
            if (productionOrder == null)
                throw new ArgumentException("Không tìm thấy lệnh sản xuất");

            // Create slip based on production order type
            switch (productionOrder.Type)
            {
                case "Cắt kính":
                    return await CreateCutGlassSlipAsync(dto);
                case "Ghép kính":
                    return await CreateGlueButylSlipAsync(dto);
                case "Sản xuất keo":
                case "Đổ keo":
                    return await CreateChemicalExportSlipAsync(dto);
                default:
                    throw new ArgumentException("Loại lệnh sản xuất không được hỗ trợ");
            }
        }

        public async Task<InventorySlipDto> CreateCutGlassSlipAsync(CreateInventorySlipDto dto, MappingInfoDto mappingInfo = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var slip = new InventorySlip
                {
                    SlipCode = await GenerateSlipCodeAsync(dto.ProductionOrderId),
                    Description = dto.Description,
                    ProductionOrderId = dto.ProductionOrderId,
                    CreatedBy = 1, // TODO: Get from current user context
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.InventorySlips.Add(slip);
                await _context.SaveChangesAsync();

                var details = new List<InventorySlipDetail>();
                
                foreach (var detailDto in dto.Details)
                {
                    var detailIndex = dto.Details.IndexOf(detailDto);
                    
                    // Find corresponding product classification from mappingInfo
                    var classification = mappingInfo?.ProductClassifications?.FirstOrDefault(c => c.Index == detailIndex);
                    
                    int? productionOutputId = null;
                    if (classification != null)
                    {
                        if (classification.ProductType == "Bán thành phẩm" && classification.ProductionOutputId.HasValue)
                        {
                            productionOutputId = classification.ProductionOutputId.Value;
                        }
                    }
                    
                    var detail = new InventorySlipDetail
                    {
                        InventorySlipId = slip.Id,
                        ProductId = detailDto.ProductId,
                        Quantity = detailDto.Quantity,
                        Note = detailDto.Note,
                        SortOrder = detailDto.SortOrder,
                        ProductionOutputId = productionOutputId,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };
                    details.Add(detail);
                }

                _context.InventorySlipDetails.AddRange(details);
                await _context.SaveChangesAsync();

                // Create mappings if provided
                if (dto.Mappings != null && dto.Mappings.Any())
                {
                    var mappings = new List<MaterialOutputMapping>();
                    
                    // Convert indices to actual detail IDs
                    foreach (var mappingDto in dto.Mappings)
                    {
                        // Find the actual detail IDs using indices
                        var inputDetail = details.ElementAtOrDefault(mappingDto.InputDetailId);
                        var outputDetail = details.ElementAtOrDefault(mappingDto.OutputDetailId);
                        
                        if (inputDetail != null && outputDetail != null)
                        {
                            var mapping = new MaterialOutputMapping
                            {
                                InputDetailId = inputDetail.Id,
                                OutputDetailId = outputDetail.Id,
                                Note = mappingDto.Note,
                                CreatedAt = DateTime.Now,
                                UpdatedAt = DateTime.Now
                            };
                            mappings.Add(mapping);
                        }
                    }

                    if (mappings.Any())
                    {
                        _context.MaterialOutputMappings.AddRange(mappings);
                        await _context.SaveChangesAsync();
                    }
                }

                // Update ProductionOutput finished quantities for semi-finished products
                await UpdateProductionOutputFinishedQuantitiesAsync(details, mappingInfo);

                await transaction.CommitAsync();
                var result = await GetInventorySlipByIdAsync(slip.Id);
                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<InventorySlipDto> CreateChemicalExportSlipAsync(CreateInventorySlipDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create main slip
                var slip = new InventorySlip
                {
                    SlipCode = await GenerateSlipCodeAsync(dto.ProductionOrderId),
                    Description = dto.Description,
                    ProductionOrderId = dto.ProductionOrderId,
                    CreatedBy = 1, // TODO: Get from current user context
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.InventorySlips.Add(slip);
                await _context.SaveChangesAsync();

                // Create details - Sử dụng ProductionOutputId để gom nhóm nguyên liệu theo sản phẩm mục tiêu
                var details = new List<InventorySlipDetail>();
                foreach (var detailDto in dto.Details)
                {
                    var detail = new InventorySlipDetail
                    {
                        InventorySlipId = slip.Id,
                        ProductId = detailDto.ProductId,
                        Quantity = detailDto.Quantity,
                        Note = detailDto.Note,
                        SortOrder = detailDto.SortOrder,
                        ProductionOutputId = detailDto.ProductionOutputId, // Sử dụng để gom nhóm
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };
                    details.Add(detail);
                }

                _context.InventorySlipDetails.AddRange(details);
                await _context.SaveChangesAsync();

                // Cập nhật ProductionOutput finished quantities cho phiếu xuất vật liệu
                await UpdateProductionOutputFinishedQuantitiesForMaterialExportAsync(dto);

                await transaction.CommitAsync();
                return await GetInventorySlipByIdAsync(slip.Id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<InventorySlipDto> CreateGlueButylSlipAsync(CreateInventorySlipDto dto)
        {
            // Tạo phiếu xuất keo butyl - Sử dụng cùng logic với chemical export
            // Không sử dụng ProductionOutputId cho phiếu xuất vật liệu
            return await CreateChemicalExportSlipAsync(dto);
        }

        public async Task<InventorySlipDto> GetInventorySlipByIdAsync(int id)
        {
            try
            {
                var slip = await _context.InventorySlips
                    .Include(s => s.ProductionOrder)
                    .Include(s => s.CreatedByEmployee)
                    .Include(s => s.Details)
                        .ThenInclude(d => d.Product)
                    .Include(s => s.Details)
                        .ThenInclude(d => d.ProductionOutput)
                    .Include(s => s.Details)
                        .ThenInclude(d => d.OutputMappings)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (slip == null)
                {
                    return null;
                }
                
                if (slip.Details != null)
                {
                    foreach (var detail in slip.Details)
                    {
                        // Load OutputMappings where this detail is the INPUT (raw material)
                        var outputMappings = await _context.MaterialOutputMappings
                            .Include(m => m.OutputDetail)
                                .ThenInclude(od => od.Product)
                            .Where(m => m.InputDetailId == detail.Id)
                            .ToListAsync();
                        
                        detail.OutputMappings = outputMappings;
                        
                        // Load InputMappings where this detail is the OUTPUT (created from other products)
                        var inputMappings = await _context.MaterialOutputMappings
                            .Include(m => m.InputDetail)
                                .ThenInclude(id => id.Product)
                            .Where(m => m.OutputDetailId == detail.Id)
                            .ToListAsync();
                        
                        // Set the InputMappings navigation property
                        detail.InputMappings = inputMappings;
                    }
                }
                
                var result = await MapToDtoAsync(slip);
                return result;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<List<InventorySlipDto>> GetAllInventorySlipsAsync()
        {
            var slips = await _context.InventorySlips
                .Include(s => s.ProductionOrder)
                .Include(s => s.CreatedByEmployee)
                .Include(s => s.Details)
                    .ThenInclude(d => d.Product)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            var result = new List<InventorySlipDto>();
            foreach (var slip in slips)
            {
                result.Add(await MapToDtoAsync(slip));
            }
            return result;
        }

        public async Task<List<InventorySlipDto>> GetInventorySlipsByProductionOrderAsync(int productionOrderId)
        {
            try
            {
                var slips = await _context.InventorySlips
                    .Include(s => s.ProductionOrder)
                    .Include(s => s.CreatedByEmployee)
                    .Include(s => s.Details)
                        .ThenInclude(d => d.Product)
                    .Include(s => s.Details)
                        .ThenInclude(d => d.ProductionOutput)
                    .Where(s => s.ProductionOrderId == productionOrderId)
                    .OrderByDescending(s => s.CreatedAt)
                    .ToListAsync();
               
                foreach (var slip in slips)
                {
                    if (slip.Details != null)
                    {
                        foreach (var detail in slip.Details)
                        {                            
                            var outputMappings = await _context.MaterialOutputMappings
                                .Include(m => m.OutputDetail)
                                    .ThenInclude(od => od.Product)
                                .Where(m => m.InputDetailId == detail.Id)
                                .ToListAsync();
                            
                            detail.OutputMappings = outputMappings;                            
                            
                            var inputMappings = await _context.MaterialOutputMappings
                                .Include(m => m.InputDetail)
                                    .ThenInclude(id => id.Product)
                                .Where(m => m.OutputDetailId == detail.Id)
                                .ToListAsync();
                            
                            detail.InputMappings = inputMappings;
                        }
                    }
                }

                            var result = new List<InventorySlipDto>();
            foreach (var slip in slips)
            {
                result.Add(await MapToDtoAsync(slip));
            }
            return result;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<bool> DeleteInventorySlipAsync(int id)
        {
            try
            {
                var slip = await _context.InventorySlips
                    .Include(s => s.Details)
                    .FirstOrDefaultAsync(s => s.Id == id);
                
                if (slip == null) 
                {
                    return false;
                }

                var detailIds = slip.Details.Select(d => d.Id).ToList();
                var mappings = await _context.MaterialOutputMappings
                    .Where(m => detailIds.Contains(m.InputDetailId) || detailIds.Contains(m.OutputDetailId))
                    .ToListAsync();
                
                if (mappings.Any())
                {
                    _context.MaterialOutputMappings.RemoveRange(mappings);
                }

                _context.InventorySlipDetails.RemoveRange(slip.Details);
                
                _context.InventorySlips.Remove(slip);
                
                await _context.SaveChangesAsync();
                
                return true;
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<ProductionOrderInfoDto> GetProductionOrderInfoAsync(int productionOrderId)
        {
            var productionOrder = await _context.ProductionOrders
                .FirstOrDefaultAsync(po => po.Id == productionOrderId);

            // If ProductionOrder doesn't exist, try to get info from ProductionOutput
            if (productionOrder == null)
            {
                var productionOutput = await _context.ProductionOutputs
                    .Include(po => po.ProductionOrder)
                    .FirstOrDefaultAsync(po => po.ProductionOrderId == productionOrderId);

                if (productionOutput?.ProductionOrder == null)
                {
                    // If still not found, try to get from ProductionMaterial through ProductionOutput
                    var productionMaterial = await _context.ProductionMaterials
                        .Include(pm => pm.ProductionOutput)
                            .ThenInclude(po => po.ProductionOrder)
                        .FirstOrDefaultAsync(pm => pm.ProductionOutput.ProductionOrderId == productionOrderId);

                    if (productionMaterial?.ProductionOutput?.ProductionOrder == null)
                    {
                        return null; 
                    }

                    productionOrder = productionMaterial.ProductionOutput.ProductionOrder;
                }
                else
                {
                    productionOrder = productionOutput.ProductionOrder;
                }
            }

            var productionOutputs = await _context.ProductionOutputs
                .Include(po => po.Product)
                .Where(po => po.ProductionOrderId == productionOrderId)
                .ToListAsync();

            // For cut glass slips: separate raw materials, semi-finished products, and glass
            List<ProductInfoDto> rawMaterials = new List<ProductInfoDto>();
            List<ProductInfoDto> semiFinishedProducts = new List<ProductInfoDto>();
            List<ProductInfoDto> glassProducts = new List<ProductInfoDto>();

            if (productionOrder.Type == "Cắt kính")
            {
                // Raw materials (NVL) - from Product table
                var nvlProducts = await _context.Products
                    .Where(p => p.ProductType == "NVL" || p.ProductType == "Nguyên vật liệu")
                    .ToListAsync();
                
                rawMaterials = nvlProducts.Select(p => new ProductInfoDto
                {
                    Id = p.Id,
                    ProductCode = p.ProductCode,
                    ProductName = p.ProductName,
                    ProductType = p.ProductType,
                    UOM = p.UOM,
                    Height = p.Height,
                    Width = p.Width,
                    Thickness = p.Thickness,
                    Weight = p.Weight,
                    Quantity = p.quantity,
                    UnitPrice = p.UnitPrice
                }).ToList();

                // Semi-finished products from ProductionOutput
                semiFinishedProducts = productionOutputs.Select(po => new ProductInfoDto
                {
                    Id = po.ProductId,
                    ProductCode = po.Product?.ProductCode,
                    ProductName = po.ProductName,
                    ProductType = "Bán thành phẩm",
                    UOM = po.UOM?.ToString(),
                    Height = po.Product?.Height,
                    Width = po.Product?.Width,
                    Thickness = po.Product?.Thickness,
                    Weight = po.Product?.Weight,
                    Quantity = po.Product?.quantity ?? 0,
                    UnitPrice = po.Product?.UnitPrice
                }).ToList();

                
                var semiFinishedProductsFromDb = await _context.Products
                    .Where(p => p.ProductType == "Bán thành phẩm" || p.ProductType == "BTP")
                    .ToListAsync();
                
                var additionalSemiFinishedProducts = semiFinishedProductsFromDb
                    .Where(p => !productionOutputs.Any(po => po.ProductId == p.Id)) // Don't duplicate
                    .Select(p => new ProductInfoDto
                    {
                        Id = p.Id,
                        ProductCode = p.ProductCode,
                        ProductName = p.ProductName,
                        ProductType = p.ProductType,
                        UOM = p.UOM,
                        Height = p.Height,
                        Width = p.Width,
                        Thickness = p.Thickness,
                        Weight = p.Weight,
                        Quantity = p.quantity,
                        UnitPrice = p.UnitPrice
                    }).ToList();
                
                semiFinishedProducts.AddRange(additionalSemiFinishedProducts);

                // Glass products 
                var glassProductsFromDb = await _context.Products
                    .Where(p => p.ProductType == "Kính dư" || p.ProductType == "Kính")
                    .ToListAsync();
                
                glassProducts = glassProductsFromDb.Select(p => new ProductInfoDto
                {
                    Id = p.Id,
                    ProductCode = p.ProductCode,
                    ProductName = p.ProductName,
                    ProductType = p.ProductType,
                    UOM = p.UOM,
                    Height = p.Height,
                    Width = p.Width,
                    Thickness = p.Thickness,
                    Weight = p.Weight,
                    Quantity = p.quantity,
                    UnitPrice = p.UnitPrice
                }).ToList();
            }
            else
            {
                // For chemical export and glue butyl export: get materials from production_materials
                var productionMaterials = await _context.ProductionMaterials
                    .Include(pm => pm.Product)
                    .Include(pm => pm.ProductionOutput)
                    .Where(pm => pm.ProductionOutput.ProductionOrderId == productionOrderId)
                    .ToListAsync();

                // Get unique products from production materials
                var materialProducts = productionMaterials
                    .Select(pm => pm.Product)
                    .Where(p => p != null)
                    .Distinct()
                    .ToList();

                // Also add some common raw materials that might be needed
                var additionalRawMaterials = await _context.Products
                    .Where(p => p.ProductType == "Nguyên vật liệu" || p.ProductType == "NVL")
                    .ToListAsync();

                // Combine and remove duplicates
                var allProducts = new List<Product>();
                allProducts.AddRange(materialProducts);
                
                foreach (var raw in additionalRawMaterials)
                {
                    if (!allProducts.Any(p => p.Id == raw.Id))
                    {
                        allProducts.Add(raw);
                    }
                }

                rawMaterials = allProducts.Select(p => new ProductInfoDto
                {
                    Id = p.Id,
                    ProductCode = p.ProductCode,
                    ProductName = p.ProductName,
                    ProductType = p.ProductType,
                    UOM = p.UOM,
                    Height = p.Height,
                    Width = p.Width,
                    Thickness = p.Thickness,
                    Weight = p.Weight,
                    Quantity = p.quantity,
                    UnitPrice = p.UnitPrice
                }).ToList();
            }

            return new ProductionOrderInfoDto
            {
                Id = productionOrder.Id,
                ProductionOrderCode = productionOrder.ProductionOrderCode,
                Type = productionOrder.Type,
                Description = productionOrder.Description,
                ProductionOutputs = productionOutputs.Select(po => new ProductionOutputDto
                {
                    Id = po.Id,
                    ProductId = po.ProductId,
                    ProductName = po.ProductName,
                    UOM = po.UOM?.ToString(),
                    Amount = po.Amount,
                    Finished = po.Finished,
                    Defected = po.Defected
                }).ToList(),
                AvailableProducts = rawMaterials.Concat(semiFinishedProducts).Concat(glassProducts).ToList(),
                // Separate lists for cut glass slips
                RawMaterials = productionOrder.Type == "Cắt kính" ? rawMaterials : new List<ProductInfoDto>(),
                SemiFinishedProducts = productionOrder.Type == "Cắt kính" ? semiFinishedProducts : new List<ProductInfoDto>(),
                GlassProducts = productionOrder.Type == "Cắt kính" ? glassProducts : new List<ProductInfoDto>()
            };
        }

        public async Task<List<InventorySlipDetailDto>> GetOutputsFromInputMaterialAsync(int inputDetailId)
        {
            var mappings = await _context.MaterialOutputMappings
                .Include(m => m.OutputDetail)
                    .ThenInclude(d => d.Product)
                .Where(m => m.InputDetailId == inputDetailId)
                .ToListAsync();

            return mappings.Select(m => new InventorySlipDetailDto
            {
                Id = m.OutputDetail.Id,
                ProductId = m.OutputDetail.ProductId,
                ProductCode = m.OutputDetail.Product.ProductCode,
                ProductName = m.OutputDetail.Product.ProductName,
                ProductType = m.OutputDetail.Product.ProductType,
                UOM = m.OutputDetail.Product.UOM,
                Quantity = m.OutputDetail.Quantity,
                Note = m.OutputDetail.Note,
                SortOrder = m.OutputDetail.SortOrder,
                ProductionOutputId = m.OutputDetail.ProductionOutputId
            }).ToList();
        }

        public async Task<List<InventorySlipDetailDto>> GetInputMaterialsForOutputAsync(int outputDetailId)
        {
            var mappings = await _context.MaterialOutputMappings
                .Include(m => m.InputDetail)
                    .ThenInclude(d => d.Product)
                .Where(m => m.OutputDetailId == outputDetailId)
                .ToListAsync();

            return mappings.Select(m => new InventorySlipDetailDto
            {
                Id = m.InputDetail.Id,
                ProductId = m.InputDetail.ProductId,
                ProductCode = m.InputDetail.Product.ProductCode,
                ProductName = m.InputDetail.Product.ProductName,
                ProductType = m.InputDetail.Product.ProductType,
                UOM = m.InputDetail.Product.UOM,
                Quantity = m.InputDetail.Quantity,
                Note = m.InputDetail.Note,
                SortOrder = m.InputDetail.SortOrder,
                ProductionOutputId = m.InputDetail.ProductionOutputId
            }).ToList();
        }

        public async Task<bool> ValidateSlipCreationAsync(CreateInventorySlipDto dto)
        {
            if (dto.Details == null || !dto.Details.Any())
            {
                return false;
            }

            var productionOrder = await _context.ProductionOrders
                .FirstOrDefaultAsync(po => po.Id == dto.ProductionOrderId);
            
            if (productionOrder == null)
            {
                return false;
            }

            return true;
        }

        public async Task<string> GenerateSlipCodeAsync(int productionOrderId)
        {
            var productionOrder = await _context.ProductionOrders
                .FirstOrDefaultAsync(po => po.Id == productionOrderId);            
            var prefix = "PH"; 
            var date = DateTime.Now.ToString("yyyyMMdd");
            var count = await _context.InventorySlips
                .CountAsync(s => s.ProductionOrderId == productionOrderId);
            
            return $"{prefix}-{productionOrder?.ProductionOrderCode}-{date}-{count + 1:D3}";
        }

        public async Task<bool> AddMappingsAsync(int slipId, List<CreateMaterialOutputMappingDto> mappings)
        {
            if (mappings == null || mappings.Count == 0) return true;

            var detailIds = await _context.InventorySlipDetails
                .Where(d => d.InventorySlipId == slipId)
                .Select(d => d.Id)
                .ToListAsync();

            // Validate all mapping ids belong to this slip
            foreach (var map in mappings)
            {
                if (!detailIds.Contains(map.InputDetailId) || !detailIds.Contains(map.OutputDetailId))
                {
                    throw new ArgumentException("Mapping chi tiết không thuộc về phiếu này");
                }
            }

            var entities = mappings.Select(m => new MaterialOutputMapping
            {
                InputDetailId = m.InputDetailId,
                OutputDetailId = m.OutputDetailId,
                Note = m.Note,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now
            }).ToList();

            _context.MaterialOutputMappings.AddRange(entities);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<ProductInfoDto> CreateProductAsync(CreateInventoryProductDto dto)
        {
            var product = new Product
            {
                ProductCode = dto.ProductCode,
                ProductName = dto.ProductName,
                ProductType = dto.ProductType,
                UOM = dto.UOM,
                Height = dto.Height,
                Width = dto.Width,
                Thickness = dto.Thickness,
                Weight = dto.Weight,
                UnitPrice = dto.UnitPrice,
                quantity = 0 
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return new ProductInfoDto
            {
                Id = product.Id,
                ProductCode = product.ProductCode,
                ProductName = product.ProductName,
                ProductType = product.ProductType,
                UOM = product.UOM,
                Height = product.Height,
                Width = product.Width,
                Thickness = product.Thickness,
                Weight = product.Weight,
                Quantity = product.quantity,
                UnitPrice = product.UnitPrice
            };
        }

        /// <summary>
        /// Lấy danh sách nguyên liệu từ production_materials dựa trên production_output_id
        /// </summary>
        public async Task<List<ProductionMaterialDto>> GetMaterialsByProductionOutputAsync(int productionOutputId)
        {
            var materials = await _context.ProductionMaterials
                .Include(pm => pm.Product)
                .Include(pm => pm.ProductionOutput)
                .Where(pm => pm.ProductionOutputId == productionOutputId)
                .ToListAsync();

            return materials.Select(pm => new ProductionMaterialDto
            {
                Id = pm.Id,
                ProductId = pm.ProductId,
                ProductName = pm.Product?.ProductName ?? $"Sản phẩm {pm.ProductId}",
                ProductCode = pm.Product?.ProductCode ?? "",
                UOM = pm.UOM?.ToString() ?? pm.Product?.UOM ?? "cái",
                Amount = pm.Amount ?? 0,
                ProductionOutputId = pm.ProductionOutputId
            }).ToList();
        }

        public async Task<InventorySlipDto> UpdateInventorySlipAsync(int id, CreateInventorySlipDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var existingSlip = await _context.InventorySlips
                    .Include(s => s.Details)
                    .FirstOrDefaultAsync(s => s.Id == id);

                if (existingSlip == null)
                    throw new ArgumentException("Không tìm thấy phiếu kho để cập nhật");

                // Update main slip properties
                existingSlip.Description = dto.Description;
                existingSlip.UpdatedAt = DateTime.Now;

                // Snapshot old details and mappings BEFORE removing them so we can restore mappings afterwards
                var oldDetails = existingSlip.Details.ToList();
                var oldDetailIds = oldDetails.Select(d => d.Id).ToList();

                var oldMappingsSnapshot = await _context.MaterialOutputMappings
                    .Include(m => m.InputDetail)
                    .Include(m => m.OutputDetail)
                    .Where(m => oldDetailIds.Contains(m.InputDetailId) || oldDetailIds.Contains(m.OutputDetailId))
                    .Select(m => new
                    {
                        InputProductId = m.InputDetail.ProductId,
                        InputSortOrder = m.InputDetail.SortOrder,
                        OutputProductId = m.OutputDetail.ProductId,
                        OutputSortOrder = m.OutputDetail.SortOrder,
                        m.Note
                    })
                    .ToListAsync();

                // Remove existing mappings (they reference old detail IDs)
                var existingMappings = await _context.MaterialOutputMappings
                    .Where(m => oldDetailIds.Contains(m.InputDetailId) || oldDetailIds.Contains(m.OutputDetailId))
                    .ToListAsync();
                if (existingMappings.Any())
                {
                    _context.MaterialOutputMappings.RemoveRange(existingMappings);
                }

                // Remove existing details
                _context.InventorySlipDetails.RemoveRange(existingSlip.Details);

                // Create new details
                var details = new List<InventorySlipDetail>();
                foreach (var detailDto in dto.Details)
                {
                    var detail = new InventorySlipDetail
                    {
                        InventorySlipId = existingSlip.Id,
                        ProductId = detailDto.ProductId,
                        Quantity = detailDto.Quantity,
                        Note = detailDto.Note,
                        SortOrder = detailDto.SortOrder,
                        ProductionOutputId = detailDto.ProductionOutputId,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };
                    details.Add(detail);
                }

                _context.InventorySlipDetails.AddRange(details);
                await _context.SaveChangesAsync(); // Save to get new detail IDs

                // If client did not provide new mappings, restore previous mappings using snapshot
                if (dto.Mappings == null || !dto.Mappings.Any())
                {
                    if (oldMappingsSnapshot.Any())
                    {                        
                        var newDetailsLookup = details
                            .GroupBy(d => new { d.ProductId, d.SortOrder })
                            .ToDictionary(g => g.Key, g => g.First());

                        var mappingsToRestore = new List<MaterialOutputMapping>();
                        foreach (var snap in oldMappingsSnapshot)
                        {
                            var inputKey = new { ProductId = snap.InputProductId, SortOrder = snap.InputSortOrder };
                            var outputKey = new { ProductId = snap.OutputProductId, SortOrder = snap.OutputSortOrder };

                            if (newDetailsLookup.TryGetValue(inputKey, out var newInput) &&
                                newDetailsLookup.TryGetValue(outputKey, out var newOutput))
                            {
                                mappingsToRestore.Add(new MaterialOutputMapping
                                {
                                    InputDetailId = newInput.Id,
                                    OutputDetailId = newOutput.Id,
                                    Note = snap.Note,
                                    CreatedAt = DateTime.Now,
                                    UpdatedAt = DateTime.Now
                                });
                            }
                        }

                        if (mappingsToRestore.Any())
                        {
                            _context.MaterialOutputMappings.AddRange(mappingsToRestore);
                        }
                    }
                }
                else
                {                    
                    var mappings = new List<MaterialOutputMapping>();
                    foreach (var mappingDto in dto.Mappings)
                    {
                        if (mappingDto.InputDetailId >= 0 && mappingDto.InputDetailId < details.Count &&
                            mappingDto.OutputDetailId >= 0 && mappingDto.OutputDetailId < details.Count)
                        {
                            var inputDetail = details[mappingDto.InputDetailId];
                            var outputDetail = details[mappingDto.OutputDetailId];
                            mappings.Add(new MaterialOutputMapping
                            {
                                InputDetailId = inputDetail.Id,
                                OutputDetailId = outputDetail.Id,
                                Note = mappingDto.Note,
                                CreatedAt = DateTime.Now,
                                UpdatedAt = DateTime.Now
                            });
                        }
                    }
                    if (mappings.Any())
                    {
                        _context.MaterialOutputMappings.AddRange(mappings);
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var result = await GetInventorySlipByIdAsync(existingSlip.Id);
                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private async Task<InventorySlipDto> MapToDtoAsync(InventorySlip slip)
        {
            // Get all product IDs that are production outputs for this production order
            var productionOutputProductIds = _context.ProductionOutputs
                .Where(po => po.ProductionOrderId == slip.ProductionOrderId)
                .Select(po => po.ProductId)
                .ToList();

            var details = new List<InventorySlipDetailDto>();
            
            // Xử lý khác nhau cho từng loại phiếu
            if (slip.ProductionOrder?.Type == "Cắt kính")
            {
                // Giữ nguyên logic cũ cho phiếu cắt kính
                foreach (var detail in slip.Details.OrderBy(d => d.SortOrder))
                {                
                    string productType;
                    
                    if (detail.OutputMappings != null && detail.OutputMappings.Any())
                    {
                        // This detail has output mappings (is an input to an output)
                        productType = "NVL";
                    }
                    else if (productionOutputProductIds.Contains(detail.ProductId))
                    {
                        // This detail's product is found in production outputs for this production order
                        productType = "Bán thành phẩm";
                    }
                    else if (detail.InputMappings != null && detail.InputMappings.Any())
                    {
                        // This detail has input mappings (is an output from an input) and is not a semi-finished product
                        productType = "Kính dư";
                    }
                    else
                    {
                        // Fallback to the product's own type
                        productType = detail.Product?.ProductType ?? "NVL";
                    }

                    var detailDto = new InventorySlipDetailDto
                    {
                        Id = detail.Id,
                        ProductId = detail.ProductId,
                        ProductCode = detail.Product?.ProductCode,
                        ProductName = detail.Product?.ProductName,
                        ProductType = productType,
                        UOM = detail.Product?.UOM,
                        Quantity = detail.Quantity,
                        Note = detail.Note,
                        SortOrder = detail.SortOrder,
                        ProductionOutputId = detail.ProductionOutputId,
                        OutputMappings = detail.OutputMappings?.Select(m => new MaterialOutputMappingDto
                        {
                            Id = m.Id,
                            OutputDetailId = m.OutputDetailId,
                            OutputProductName = m.OutputDetail?.Product?.ProductName,
                            OutputProductCode = m.OutputDetail?.Product?.ProductCode,
                            Note = m.Note
                        }).ToList() ?? new List<MaterialOutputMappingDto>()
                    };
                    
                    details.Add(detailDto);
                }
            }
            else
            {
                // Cho phiếu xuất vật liệu (chemical export, glue butyl): gom nhóm theo production_output_id
                // Sắp xếp theo production_output_id để gom nhóm
                var sortedDetails = slip.Details
                    .OrderBy(d => d.ProductionOutputId ?? int.MaxValue) // Những detail không có production_output_id sẽ ở cuối
                    .ThenBy(d => d.SortOrder)
                    .ToList();

                foreach (var detail in sortedDetails)
                {
                    // Lấy thông tin sản phẩm mục tiêu từ ProductionOutput
                    string? targetProductName = null;
                    string? targetProductCode = null;
                    
                    if (detail.ProductionOutputId.HasValue)
                    {
                        var productionOutput = await _context.ProductionOutputs
                            .Include(po => po.Product)
                            .FirstOrDefaultAsync(po => po.Id == detail.ProductionOutputId.Value);
                        
                        if (productionOutput?.Product != null)
                        {
                            targetProductName = productionOutput.Product.ProductName;
                            targetProductCode = productionOutput.Product.ProductCode;
                        }
                    }

                    var detailDto = new InventorySlipDetailDto
                    {
                        Id = detail.Id,
                        ProductId = detail.ProductId,
                        ProductCode = detail.Product?.ProductCode,
                        ProductName = detail.Product?.ProductName,
                        ProductType = detail.Product?.ProductType ?? "NVL",
                        UOM = detail.Product?.UOM,
                        Quantity = detail.Quantity,
                        Note = detail.Note,
                        SortOrder = detail.SortOrder,
                        ProductionOutputId = detail.ProductionOutputId,
                        TargetProductName = targetProductName,
                        TargetProductCode = targetProductCode,
                        OutputMappings = new List<MaterialOutputMappingDto>() // Không có mapping cho phiếu xuất vật liệu
                    };
                    
                    details.Add(detailDto);
                }
            }

            return new InventorySlipDto
            {
                Id = slip.Id,
                SlipCode = slip.SlipCode,
                Description = slip.Description,
                ProductionOrderId = slip.ProductionOrderId,
                ProductionOrderCode = slip.ProductionOrder?.ProductionOrderCode,
                ProductionOrderType = slip.ProductionOrder?.Type,
                CreatedBy = slip.CreatedBy,
                CreatedByEmployeeName = slip.CreatedByEmployee?.FullName,
                CreatedAt = slip.CreatedAt,
                UpdatedAt = slip.UpdatedAt,
                Details = details
            };
        }
        
        public async Task<PaginatedProductsDto> GetPaginatedProductsAsync(ProductSearchRequestDto request)
        {
            var productionOrder = await _context.ProductionOrders
                .FirstOrDefaultAsync(po => po.Id == request.ProductionOrderId);
            
            if (productionOrder == null || productionOrder.Type != "Cắt kính")
            {
                throw new ArgumentException("Production order not found or not a cut glass order");
            }

            IQueryable<Product> baseQuery = _context.Products.AsQueryable();
            
            switch (request.ProductType?.ToLower())
            {
                case "nvl":
                case "nguyên vật liệu":
                    baseQuery = baseQuery.Where(p => p.ProductType == "NVL" || p.ProductType == "Nguyên vật liệu");
                    break;
                case "bán thành phẩm":
                case "btp":
                    baseQuery = baseQuery.Where(p => p.ProductType == "Bán thành phẩm" || p.ProductType == "BTP");
                    break;
                case "kính dư":
                case "kính":
                    baseQuery = baseQuery.Where(p => p.ProductType == "Kính dư" || p.ProductType == "Kính");
                    break;
                default:
                    // If no specific type, include all relevant types for cut glass
                    baseQuery = baseQuery.Where(p => 
                        p.ProductType == "NVL" || 
                        p.ProductType == "Nguyên vật liệu" ||
                        p.ProductType == "Bán thành phẩm" ||  
                        p.ProductType == "Kính dư" 
                    );
                    break;
            }

            // Apply search term if provided
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                baseQuery = baseQuery.Where(p => 
                    p.ProductName.ToLower().Contains(searchTerm) ||
                    p.ProductCode.ToLower().Contains(searchTerm)
                );
            }

            // Get total count for pagination
            var totalCount = await baseQuery.CountAsync();

            // Apply sorting
            switch (request.SortBy?.ToLower())
            {
                case "productname":
                    baseQuery = request.SortDescending 
                        ? baseQuery.OrderByDescending(p => p.ProductName)
                        : baseQuery.OrderBy(p => p.ProductName);
                    break;
                case "productcode":
                    baseQuery = request.SortDescending 
                        ? baseQuery.OrderByDescending(p => p.ProductCode)
                        : baseQuery.OrderBy(p => p.ProductCode);
                    break;
                case "id":
                    baseQuery = request.SortDescending 
                        ? baseQuery.OrderByDescending(p => p.Id)
                        : baseQuery.OrderBy(p => p.Id);
                    break;
                default:
                    baseQuery = baseQuery.OrderBy(p => p.ProductName);
                    break;
            }

            var skip = (request.PageNumber - 1) * request.PageSize;
            var products = await baseQuery
                .Skip(skip)
                .Take(request.PageSize)
                .ToListAsync();

            var productDtos = products.Select(p => new ProductInfoDto
            {
                Id = p.Id,
                ProductCode = p.ProductCode,
                ProductName = p.ProductName,
                ProductType = p.ProductType,
                UOM = p.UOM,
                Height = p.Height,
                Width = p.Width,
                Thickness = p.Thickness,
                Weight = p.Weight,
                Quantity = p.quantity,
                UnitPrice = p.UnitPrice
            }).ToList();

            // Calculate pagination info
            var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);
            var hasPreviousPage = request.PageNumber > 1;
            var hasNextPage = request.PageNumber < totalPages;

            return new PaginatedProductsDto
            {
                Products = productDtos,
                TotalCount = totalCount,
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                TotalPages = totalPages,
                HasPreviousPage = hasPreviousPage,
                HasNextPage = hasNextPage
            };
        }

        /// <summary>
        /// Updates the finished quantities in ProductionOutput for semi-finished products
        /// </summary>
        private async Task UpdateProductionOutputFinishedQuantitiesAsync(List<InventorySlipDetail> details, MappingInfoDto mappingInfo)
        {
            try
            {
                // Group details by production output ID for semi-finished products
                var semiFinishedDetails = new List<(int ProductionOutputId, decimal Quantity)>();
                
                foreach (var detail in details)
                {
                    if (detail.ProductionOutputId.HasValue)
                    {
                        // For cut glass slips, use productClassifications to determine product type
                        if (mappingInfo?.ProductClassifications != null && mappingInfo.ProductClassifications.Any())
                        {
                            // Find the corresponding classification by matching productId
                            var classification = mappingInfo.ProductClassifications.FirstOrDefault(c => c.ProductId == detail.ProductId);
                            
                            if (classification != null)
                            {
                                if (classification.ProductType == "Bán thành phẩm")
                                {
                                    semiFinishedDetails.Add((detail.ProductionOutputId.Value, detail.Quantity));
                                }
                            }
                        }
                        else
                        {
                            // For non-cut glass slips, if ProductionOutputId is set, it's a semi-finished product
                            semiFinishedDetails.Add((detail.ProductionOutputId.Value, detail.Quantity));
                        }
                    }
                }

                // Update ProductionOutput finished quantities
                foreach (var (productionOutputId, quantity) in semiFinishedDetails)
                {
                    var productionOutput = await _context.ProductionOutputs
                        .FirstOrDefaultAsync(po => po.Id == productionOutputId);
                    
                    if (productionOutput != null)
                    {
                        var oldFinished = productionOutput.Finished ?? 0;
                        productionOutput.Finished = oldFinished + (int)quantity;
                    }
                }

                if (semiFinishedDetails.Any())
                {
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't throw to avoid breaking the main transaction
                Console.WriteLine($"Error updating ProductionOutput finished quantities: {ex.Message}");
            }
        }

        /// <summary>
        /// Updates the finished quantities in ProductionOutput for material export slips
        /// </summary>
        private async Task UpdateProductionOutputFinishedQuantitiesForMaterialExportAsync(CreateInventorySlipDto dto)
        {
            try
            {
                // Sử dụng ProductionOutputTargets để cập nhật số lượng finished
                if (dto.ProductionOutputTargets != null && dto.ProductionOutputTargets.Any())
                {
                    foreach (var target in dto.ProductionOutputTargets)
                    {
                        var productionOutput = await _context.ProductionOutputs
                            .FirstOrDefaultAsync(po => po.Id == target.ProductionOutputId);
                        
                        if (productionOutput != null)
                        {
                            var oldFinished = productionOutput.Finished ?? 0;
                            productionOutput.Finished = oldFinished + (int)target.TargetQuantity;
                        }
                    }
                    
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                // Log the error but don't throw to avoid breaking the main transaction
                Console.WriteLine($"Error updating ProductionOutput finished quantities for material export: {ex.Message}");
            }
        }
    }
}
