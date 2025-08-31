using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.InventorySlipModule.DTO;
using SEP490.Modules.InventorySlipModule.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace SEP490.Modules.InventorySlipModule.Service
{
    public class InventorySlipService : BaseScopedService, IInventorySlipService
    {
        private readonly SEP490DbContext _context;
        private readonly IInventoryProductionOutputService _productionOutputService;
        private readonly IProductionOrderService _productionOrderService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public InventorySlipService(
            SEP490DbContext context,
            IInventoryProductionOutputService productionOutputService,
            IProductionOrderService productionOrderService,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _productionOutputService = productionOutputService;
            _productionOrderService = productionOrderService;
            _httpContextAccessor = httpContextAccessor;
        }
        private int? GetCurrentEmployeeId()
        {
            var employeeIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("employeeId");
            if (employeeIdClaim != null && int.TryParse(employeeIdClaim.Value, out int employeeId))
            {
                return employeeId;
            }
            return null;
        }

        public async Task<InventorySlipDto> CreateInventorySlipAsync(CreateInventorySlipDto dto)
        {
            var productionOrder = await _context.ProductionOrders
                .FirstOrDefaultAsync(po => po.Id == dto.ProductionOrderId);
            
            if (productionOrder == null)
                throw new ArgumentException("Không tìm thấy lệnh sản xuất");
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
                    CreatedBy = GetCurrentEmployeeId() ?? 1,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsFinalized = false
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
                        else
                        {
                            Console.WriteLine($"✗ Not a semi-finished product or missing ProductionOutputId");
                        }
                    }
                    else
                    {
                        Console.WriteLine($"Detail {detailIndex}: No classification found");
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
                if (mappingInfo?.TempMappings != null && mappingInfo.TempMappings.Any())
                {
                    var mappings = new List<MaterialOutputMapping>();
                    
                                    // Process mappings
                    
                    // Convert indices to actual detail IDs and check for duplicates
                    var processedMappings = new HashSet<string>(); // Track processed mappings to avoid duplicates
                    
                    foreach (var mappingDto in mappingInfo.TempMappings)
                    {
                        Console.WriteLine($"Processing mapping: InputDetailId={mappingDto.InputDetailId}, OutputDetailId={mappingDto.OutputDetailId}");
                        
                        // Find the actual detail IDs using indices
                        var inputDetail = details.ElementAtOrDefault(mappingDto.InputDetailId);
                        var outputDetail = details.ElementAtOrDefault(mappingDto.OutputDetailId);
                        

                        
                        if (inputDetail != null && outputDetail != null)
                        {
                            // Check for duplicate mappings using more robust key
                            var mappingKey = $"{inputDetail.Id}_{outputDetail.Id}";
                            if (processedMappings.Contains(mappingKey))
                            {        
                                continue;
                            }
                            
                            // check if this mapping already exists in database
                            var existingMapping = await _context.MaterialOutputMappings
                                .FirstOrDefaultAsync(m => m.InputDetailId == inputDetail.Id && m.OutputDetailId == outputDetail.Id);
                            
                            if (existingMapping != null)
                            {
        
                                processedMappings.Add(mappingKey);
                                continue;
                            }
                            
                            var mapping = new MaterialOutputMapping
                            {
                                InputDetailId = inputDetail.Id,
                                OutputDetailId = outputDetail.Id,
                                Note = mappingDto.Note,
                                CreatedAt = DateTime.Now,
                                UpdatedAt = DateTime.Now
                            };
                            mappings.Add(mapping);
                            processedMappings.Add(mappingKey);
    
                        }
                        else
                        {
    
                        }
                    }

                    if (mappings.Any())
                    {
                                        // Save unique mappings to database
                        
                        // Double-check for any remaining duplicates before saving
                        var uniqueMappings = mappings
                            .GroupBy(m => new { m.InputDetailId, m.OutputDetailId })
                            .Select(g => g.First())
                            .ToList();
                        
                        if (uniqueMappings.Count != mappings.Count)
                        {
            
                            mappings = uniqueMappings;
                        }
                        
                        _context.MaterialOutputMappings.AddRange(mappings);
                        await _context.SaveChangesAsync();
        
                    }
                }
                await transaction.CommitAsync();
                var result = await GetInventorySlipByIdAsync(slip.Id);
                return result;
            }
            catch (Exception)
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
                var slip = new InventorySlip
                {
                    SlipCode = await GenerateSlipCodeAsync(dto.ProductionOrderId),
                    Description = dto.Description,
                    ProductionOrderId = dto.ProductionOrderId,
                    CreatedBy = GetCurrentEmployeeId() ?? 1, 
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsFinalized = false
                };

                _context.InventorySlips.Add(slip);
                await _context.SaveChangesAsync();

                // details 
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
                        ProductionOutputId = detailDto.ProductionOutputId,
                        CreatedAt = DateTime.Now,
                        UpdatedAt = DateTime.Now
                    };
                    details.Add(detail);
                }

                // add target product(product_id = null)
                if (dto.ProductionOutputTargets != null && dto.ProductionOutputTargets.Any())
                {
                    foreach (var target in dto.ProductionOutputTargets)
                    {
                        var productionOutput = await _context.ProductionOutputs
                            .Include(po => po.Product)
                            .FirstOrDefaultAsync(po => po.Id == target.ProductionOutputId);
                        
                        if (productionOutput != null)
                        {
                            var targetProductDetail = new InventorySlipDetail
                            {
                                InventorySlipId = slip.Id,
                                ProductId = null, 
                                Quantity = target.TargetQuantity,
                                Note = $"Thành phẩm mục tiêu: {productionOutput.Product?.ProductName ?? productionOutput.ProductName}",
                                SortOrder = details.Count, 
                                ProductionOutputId = target.ProductionOutputId,
                                CreatedAt = DateTime.Now,
                                UpdatedAt = DateTime.Now
                            };
                            details.Add(targetProductDetail);
                        }
                    }
                }

                _context.InventorySlipDetails.AddRange(details);
                await _context.SaveChangesAsync();

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
            catch (Exception)
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
                            
                            // Load all mappings for this detail
                            
                            var outputMappings = await _context.MaterialOutputMappings
                                .Include(m => m.OutputDetail)
                                    .ThenInclude(od => od.Product)
                                .Where(m => m.InputDetailId == detail.Id)
                                .ToListAsync();
                            
                            // Additional check: ensure no duplicate mappings by InputDetailId + OutputDetailId combination
                            var uniqueMappings = outputMappings
                                .GroupBy(m => new { m.InputDetailId, m.OutputDetailId })
                                .Select(g => g.First())
                                .ToList();
                            
                            detail.OutputMappings = uniqueMappings;
                            
                            // Debug logging
                                            // Process unique mappings
                            
                            var inputMappings = await _context.MaterialOutputMappings
                                .Include(m => m.InputDetail)
                                    .ThenInclude(id => id.Product)
                                .Where(m => m.OutputDetailId == detail.Id)
                                .ToListAsync();
                            
                            // Additional check: ensure no duplicate mappings by InputDetailId + OutputDetailId combination
                            var uniqueInputMappings = inputMappings
                                .GroupBy(m => new { m.InputDetailId, m.OutputDetailId })
                                .Select(g => g.First())
                                .ToList();
                            
                            detail.InputMappings = uniqueInputMappings;
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
            catch (Exception)
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
                var nvlProducts = await _context.Products
                    .Where(p => (p.ProductType == "NVL" || p.ProductType == "Nguyên vật liệu")
                                 && p.UOM != null && p.UOM.ToLower() == "tấm")
                    .ToListAsync();
                
                //filter NVL not semi finished product
                var rawMaterialProductIds = productionOutputs.Select(po => po.ProductId).ToList();
                var filteredNvlProducts = nvlProducts.Where(p => !rawMaterialProductIds.Contains(p.Id)).ToList();
                
                rawMaterials = filteredNvlProducts.Select(p => new ProductInfoDto
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

                semiFinishedProducts = productionOutputs.Select(po => new ProductInfoDto
                {
                    Id = po.ProductId,
                    ProductCode = po.Product?.ProductCode,
                    ProductName = po.ProductName,
                    ProductType = "Bán thành phẩm",
                    UOM = po.Product?.UOM,
                    Height = po.Product?.Height,
                    Width = po.Product?.Width,
                    Thickness = po.Product?.Thickness,
                    Weight = po.Product?.Weight,
                    Quantity = po.Product?.quantity ?? 0,
                    UnitPrice = po.Product?.UnitPrice
                }).ToList();


                var allNvlProducts = await _context.Products
                    .Where(p => p.ProductType == "NVL" && p.UOM != null && p.UOM.ToLower() == "tấm")
                    .ToListAsync();
                
                var glassProductIds = allNvlProducts
                    .Where(p => !rawMaterialProductIds.Contains(p.Id))
                    .Select(p => p.Id)
                    .ToList();
                
                glassProducts = allNvlProducts
                    .Where(p => glassProductIds.Contains(p.Id))
                    .Select(p => new ProductInfoDto
                    {
                        Id = p.Id,
                        ProductCode = p.ProductCode,
                        ProductName = p.ProductName,
                        ProductType = "Kính dư", //mark as waste glass
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
                //materials slip
                var productionMaterials = await _context.ProductionMaterials
                    .Include(pm => pm.Product)
                    .Include(pm => pm.ProductionOutput)
                    .Where(pm => pm.ProductionOutput.ProductionOrderId == productionOrderId)
                    .ToListAsync();

                var materialProducts = productionMaterials
                    .Select(pm => pm.Product)
                    .Where(p => p != null && p.UOM != null && p.UOM.ToLower() == "tấm")
                    .Distinct()
                    .ToList();

                var additionalRawMaterials = await _context.Products
                    .Where(p => p.ProductType == "NVL" && p.UOM != null && p.UOM.ToLower() == "tấm")
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
                    UOM = po.Product?.UOM,
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

            // Disallow updates when slip finalized
            var slip = await _context.InventorySlips.FirstOrDefaultAsync(s => s.Id == slipId);
            if (slip == null) throw new ArgumentException("Phiếu không tồn tại");
            if (slip.IsFinalized) throw new ArgumentException("Phiếu đã khóa, không thể cập nhật");

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
                ProductType = "NVL", 
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

        private async Task<InventorySlipDto> MapToDtoAsync(InventorySlip slip)
        {
            var productionOutputProductIds = _context.ProductionOutputs
                .Where(po => po.ProductionOrderId == slip.ProductionOrderId)
                .Select(po => po.ProductId)
                .ToList();

            var details = new List<InventorySlipDetailDto>();

            if (slip.ProductionOrder?.Type == "Cắt kính")
            {
                foreach (var detail in slip.Details.OrderBy(d => d.SortOrder))
                {                
                    string productType;                   
                    
                    if (detail.OutputMappings != null && detail.OutputMappings.Any())
                    {
                        productType = "NVL";
                    }
                    else if (detail.InputMappings != null && detail.InputMappings.Any())
                    {
                        // Có InputMappings => đây là sản phẩm đầu ra của 1 NVL
                        productType = (detail.ProductId.HasValue && productionOutputProductIds.Contains(detail.ProductId.Value))
                            ? "Bán thành phẩm"
                            : "Kính dư";
                    }
                    else
                    {
                        // Không có mapping: fallback theo ProductionOutputs
                        productType = (detail.ProductId.HasValue && productionOutputProductIds.Contains(detail.ProductId.Value))
                            ? "Bán thành phẩm"
                            : "NVL";
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
                // chemical, glue butyl export
                var sortedDetails = slip.Details
                    .OrderBy(d => d.ProductionOutputId ?? int.MaxValue) // Những detail không có production_output_id sẽ ở cuối
                    .ThenBy(d => d.SortOrder)
                    .ToList();

                foreach (var detail in sortedDetails)
                {
                    if (detail.ProductId == null)
                    {
                        var targetProductDetail = new InventorySlipDetailDto
                        {
                            Id = detail.Id,
                            ProductId = null,
                            ProductCode = null,
                            ProductName = detail.Note?.Replace("Thành phẩm mục tiêu: ", "") ?? "Thành phẩm mục tiêu",
                            ProductType = "Thành phẩm mục tiêu",
                            UOM = "cái", // Mặc định
                            Quantity = detail.Quantity,
                            Note = detail.Note,
                            SortOrder = detail.SortOrder,
                            ProductionOutputId = detail.ProductionOutputId,
                            TargetProductName = detail.Note?.Replace("Thành phẩm mục tiêu: ", ""),
                            TargetProductCode = null,
                            OutputMappings = new List<MaterialOutputMappingDto>()
                        };
                        details.Add(targetProductDetail);
                        continue;
                    }

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
                IsFinalized = slip.IsFinalized,
                Details = details
            };
        }

        public async Task<bool> FinalizeInventorySlipAsync(int slipId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var slip = await _context.InventorySlips
                    .Include(s => s.Details)
                    .FirstOrDefaultAsync(s => s.Id == slipId);

                if (slip == null) return false;
                if (slip.IsFinalized) return true;

                var productionOrder = await _context.ProductionOrders.FirstOrDefaultAsync(po => po.Id == slip.ProductionOrderId);
                if (productionOrder == null) return false;

                if (productionOrder.Type == "Cắt kính")
                {
                    var productionOutputs = await _context.ProductionOutputs
                        .Where(po => po.ProductionOrderId == slip.ProductionOrderId)
                        .ToListAsync();                    
                    
                    if (productionOutputs.Any())
                    {                        
                        // Get all input details (raw materials - kính lớn)
                        var inputDetails = slip.Details.Where(d => d.ProductId.HasValue).ToList();
                        
                        Console.WriteLine($"Found {inputDetails.Count} input details");
                        
                        // Calculate total input quantity for each target product
                        var targetProductQuantities = new Dictionary<int, decimal>();
                        
                        // Initialize all production outputs with 0 quantity
                        foreach (var po in productionOutputs)
                        {
                            targetProductQuantities[po.Id] = 0;
                            Console.WriteLine($"Initializing ProductionOutput {po.Id} (ProductId: {po.ProductId}, ProductName: {po.ProductName}) for ProductionOrder {po.ProductionOrderId}");
                        }
                        
                        foreach (var inputDetail in inputDetails)
                        {
                            // Find the corresponding production output for this input material
                            var productionOutput = productionOutputs.FirstOrDefault(po => po.ProductId == inputDetail.ProductId);
                            
                            if (productionOutput != null)
                            {
                                // This input material contributes to the target product
                                targetProductQuantities[productionOutput.Id] += inputDetail.Quantity;
                                
                                Console.WriteLine($"Input detail {inputDetail.Id} (ProductId: {inputDetail.ProductId}, Quantity: {inputDetail.Quantity}) contributes to target product {productionOutput.Id} (ProductId: {productionOutput.ProductId}, ProductionOrderId: {productionOutput.ProductionOrderId})");
                            }
                            else
                            {
                                Console.WriteLine($"Input detail {inputDetail.Id} (ProductId: {inputDetail.ProductId}) has no direct production output in ProductionOrder {slip.ProductionOrderId} - might be waste glass");
                            }
                        }
                        
                        // Update finished quantities for each target product
                        foreach (var kvp in targetProductQuantities)
                        {
                            var productionOutputId = kvp.Key;
                            var quantity = kvp.Value;
                            
                            if (quantity > 0)
                            {
                                Console.WriteLine($"Updating target product ProductionOutput {productionOutputId} with quantity {quantity} for ProductionOrder {slip.ProductionOrderId}");
                                
                                // Get the production output and update directly
                                var productionOutput = await _context.ProductionOutputs.FindAsync(productionOutputId);
                                if (productionOutput != null)
                                {
                                    var oldFinished = productionOutput.Finished ?? 0m;
                                    productionOutput.Finished = oldFinished + quantity;
                                    Console.WriteLine($"Updated ProductionOutput {productionOutputId}: Finished {oldFinished} -> {productionOutput.Finished}");
                                }
                                else
                                {
                                    Console.WriteLine($"Warning: ProductionOutput {productionOutputId} not found");
                                }
                            }
                            else
                            {
                                Console.WriteLine($"Skipping ProductionOutput {productionOutputId} - no quantity to add");
                            }
                        }
                        
                        // Save all changes to ProductionOutputs
                        await _context.SaveChangesAsync();
                        Console.WriteLine("Successfully saved ProductionOutput updates to database");
                    }
                    else
                    {
                        Console.WriteLine($"No production outputs found for production order {slip.ProductionOrderId}");
                    }
                }
                else
                {
                    // For material export/glue, use target product details (ProductId == null)
                    var targets = slip.Details.Where(d => d.ProductId == null && d.ProductionOutputId.HasValue);
                    foreach (var t in targets)
                    {
                        var po = await _context.ProductionOutputs.FirstOrDefaultAsync(po => po.Id == t.ProductionOutputId!.Value);
                        if (po != null)
                        {
                            var oldFinished = po.Finished ?? 0m;
                            po.Finished = oldFinished + t.Quantity;
                        }
                    }
                    await _context.SaveChangesAsync();
                }

                slip.IsFinalized = true;
                slip.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();

                await _productionOrderService.CheckAndUpdateCompletionAsync(slip.ProductionOrderId);

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<InventorySlipDto> UpdateInventorySlipAsync(int id, CreateInventorySlipDto dto, MappingInfoDto mappingInfo = null)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var slip = await _context.InventorySlips
                    .Include(s => s.Details)
                    .FirstOrDefaultAsync(s => s.Id == id);
                if (slip == null) throw new ArgumentException("Không tìm thấy phiếu kho");
                if (slip.IsFinalized) throw new ArgumentException("Phiếu đã khóa, không thể cập nhật");

                // Get production order info for type checking
                var productionOrder = await _context.ProductionOrders.FirstOrDefaultAsync(po => po.Id == slip.ProductionOrderId);
                if (productionOrder == null) throw new ArgumentException("Không tìm thấy lệnh sản xuất");

                // Update header
                slip.Description = dto.Description;
                slip.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();

                // Remove old mappings and details
                var detailIds = slip.Details.Select(d => d.Id).ToList();
                var oldMappings = await _context.MaterialOutputMappings
                    .Where(m => detailIds.Contains(m.InputDetailId) || detailIds.Contains(m.OutputDetailId))
                    .ToListAsync();
                if (oldMappings.Any()) _context.MaterialOutputMappings.RemoveRange(oldMappings);
                _context.InventorySlipDetails.RemoveRange(slip.Details);
                await _context.SaveChangesAsync();

                // Insert new details
                var newDetails = new List<InventorySlipDetail>();
                foreach (var detailDto in dto.Details.OrderBy(d => d.SortOrder))
                {
                    // For cut glass slips, use mappingInfo to determine ProductionOutputId
                    int? productionOutputId = detailDto.ProductionOutputId;
                    
                    if (mappingInfo?.ProductClassifications != null && productionOrder.Type == "Cắt kính")
                    {
                        // Try to find classification by productId first (more reliable)
                        var classification = mappingInfo.ProductClassifications
                            .FirstOrDefault(c => c.ProductId == detailDto.ProductId);
                        
                        // If not found by productId, try by index
                        if (classification == null)
                        {
                            classification = mappingInfo.ProductClassifications
                                .FirstOrDefault(c => c.Index == detailDto.SortOrder);
                        }
                        
                        if (classification != null && classification.ProductionOutputId.HasValue)
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
                    newDetails.Add(detail);
                }
                _context.InventorySlipDetails.AddRange(newDetails);
                await _context.SaveChangesAsync();

                // Recreate mappings (cut glass) if provided
                if (mappingInfo?.TempMappings != null && mappingInfo.TempMappings.Any())
                {
                    Console.WriteLine($"Updating cut glass slip {id}: Processing {mappingInfo.TempMappings.Count} mappings");
                    
                    var processed = new List<MaterialOutputMapping>();
                    
                    // First pass: create mappings and collect output details that need ProductionOutputId updates
                    var outputDetailsToUpdate = new List<InventorySlipDetail>();
                    
                    foreach (var m in mappingInfo.TempMappings)
                    {
                        var inputDetail = newDetails.ElementAtOrDefault(m.InputDetailId);
                        var outputDetail = newDetails.ElementAtOrDefault(m.OutputDetailId);
                        if (inputDetail == null || outputDetail == null) continue;
                        
                        Console.WriteLine($"Mapping: InputDetail {m.InputDetailId} (ProductId: {inputDetail.ProductId}) -> OutputDetail {m.OutputDetailId} (ProductId: {outputDetail.ProductId})");
                        
                        // For cut glass slips, collect output details that need ProductionOutputId updates
                        if (productionOrder.Type == "Cắt kính" && outputDetail != null)
                        {
                            outputDetailsToUpdate.Add(outputDetail);
                        }
                        
                        processed.Add(new MaterialOutputMapping
                        {
                            InputDetailId = inputDetail.Id,
                            OutputDetailId = outputDetail.Id,
                            Note = m.Note,
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now
                        });
                    }
                    
                    // Second pass: update ProductionOutputId for output details based on current mappings
                    if (productionOrder.Type == "Cắt kính" && outputDetailsToUpdate.Any())
                    {
                        Console.WriteLine($"Updating ProductionOutputId for {outputDetailsToUpdate.Count} output details");
                        
                        // Create a set of output detail indices from the mappings
                        var outputDetailIndices = new HashSet<int>();
                        foreach (var mapping in mappingInfo.TempMappings)
                        {
                            outputDetailIndices.Add(mapping.OutputDetailId);
                        }
                        
                        foreach (var outputDetail in outputDetailsToUpdate.Distinct())
                        {
                            if (outputDetail.ProductId.HasValue)
                            {
                                // For cut glass slips, we need to determine if this is a semi-finished product
                                // Check if this detail is mapped from any input detail (meaning it's an output)
                                // find the index of this detail in the newDetails list
                                var detailIndex = newDetails.IndexOf(outputDetail);
                                var isOutputProduct = outputDetailIndices.Contains(detailIndex);
                                
                                if (isOutputProduct)
                                {
                                    // This is a semi-finished product, find the corresponding ProductionOutput
                                    var productionOutput = await _context.ProductionOutputs
                                        .FirstOrDefaultAsync(po => po.ProductId == outputDetail.ProductId.Value);
                                    
                                    if (productionOutput != null)
                                    {
                                        var oldProductionOutputId = outputDetail.ProductionOutputId;
                                        outputDetail.ProductionOutputId = productionOutput.Id;
                                        Console.WriteLine($"Updated detail {outputDetail.Id}: ProductionOutputId {oldProductionOutputId} -> {outputDetail.ProductionOutputId} (Product: {outputDetail.ProductId}) - Semi-finished product");
                                    }
                                    else
                                    {
                                        Console.WriteLine($"Warning: No ProductionOutput found for ProductId {outputDetail.ProductId}");
                                    }
                                }
                                else
                                {
                                    // This is not a semi-finished product (could be waste glass), clear ProductionOutputId
                                    if (outputDetail.ProductionOutputId.HasValue)
                                    {
                                        Console.WriteLine($"Clearing ProductionOutputId for detail {outputDetail.Id} (Product: {outputDetail.ProductId}) - Not a semi-finished product");
                                        outputDetail.ProductionOutputId = null;
                                    }
                                }
                            }
                        }
                        
                        await _context.SaveChangesAsync();
                        Console.WriteLine("Saved updated details with new ProductionOutputId values");
                        
                        var updatedDetails = await _context.InventorySlipDetails
                            .Where(d => d.InventorySlipId == slip.Id)
                            .ToListAsync();
                        
                        Console.WriteLine("Verification - Current detail ProductionOutputId values:");
                        foreach (var detail in updatedDetails.Where(d => d.ProductionOutputId.HasValue))
                        {
                            Console.WriteLine($"  Detail {detail.Id}: ProductId {detail.ProductId}, ProductionOutputId {detail.ProductionOutputId}");
                        }
                        
                        // Also verify the mappings were created correctly
                        var createdMappings = await _context.MaterialOutputMappings
                            .Include(m => m.InputDetail)
                            .Include(m => m.OutputDetail)
                            .Where(m => m.InputDetail.InventorySlipId == slip.Id)
                            .ToListAsync();
                        
                        Console.WriteLine("Verification - Created mappings:");
                        foreach (var mapping in createdMappings)
                        {
                            Console.WriteLine($"  Mapping: InputDetail {mapping.InputDetailId} (ProductId: {mapping.InputDetail.ProductId}) -> OutputDetail {mapping.OutputDetailId} (ProductId: {mapping.OutputDetail.ProductId}, ProductionOutputId: {mapping.OutputDetail.ProductionOutputId})");
                        }
                    }
                    
                    if (processed.Any())
                    {
                        // Deduplicate
                        processed = processed
                            .GroupBy(x => new { x.InputDetailId, x.OutputDetailId })
                            .Select(g => g.First()).ToList();
                        
                        Console.WriteLine($"Adding {processed.Count} unique mappings to database");
                        _context.MaterialOutputMappings.AddRange(processed);
                        await _context.SaveChangesAsync();
                        Console.WriteLine("Successfully saved new mappings");
                    }
                }

                await transaction.CommitAsync();
                return await GetInventorySlipByIdAsync(slip.Id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
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

            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                baseQuery = baseQuery.Where(p => 
                    p.ProductName.ToLower().Contains(searchTerm) ||
                    p.ProductCode.ToLower().Contains(searchTerm)
                );
            }

            var totalCount = await baseQuery.CountAsync();

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
        
        public async Task<ExportDto> GetExportInfoBySlipIdAsync(int slipId)
        {
            var slip = await _context.InventorySlips
                .Include(s => s.CreatedByEmployee)
                .Include(s => s.ProductionOrder)
                .Include(s => s.Details)
                    .ThenInclude(d => d.Product)
                .Include(s => s.Details)
                    .ThenInclude(d => d.ProductionOutput)
                        .ThenInclude(po => po.Product)
                .FirstOrDefaultAsync(s => s.Id == slipId);

            if (slip == null) throw new ArgumentException("Không tìm thấy phiếu kho");

            var exportDto = new ExportDto
            {
                EmployeeName = slip.CreatedByEmployee?.FullName
            };

            if (slip.ProductionOrder?.Type == "Cắt kính")
            {
                // For cut glass: inputs (NVL) are export; outputs (semi-finished or waste) are import
                // Determine product types similar to MapToDtoAsync
                var productionOutputProductIds = _context.ProductionOutputs
                    .Where(po => po.ProductionOrderId == slip.ProductionOrderId)
                    .Select(po => po.ProductId)
                    .ToList();

                // Load mappings for classification
                var detailIds = slip.Details.Select(d => d.Id).ToList();
                var mappings = await _context.MaterialOutputMappings
                    .Where(m => detailIds.Contains(m.InputDetailId) || detailIds.Contains(m.OutputDetailId))
                    .ToListAsync();

                foreach (var d in slip.Details.OrderBy(x => x.SortOrder))
                {
                    // For cut glass slips:
                    // - Details that are INPUTS (raw materials) have OutputMappings (they produce other products)
                    // - Details that are OUTPUTS (semi-finished) have InputMappings (they are produced from other products)
                    var hasOutputMappings = mappings.Any(m => m.InputDetailId == d.Id);
                    var hasInputMappings = mappings.Any(m => m.OutputDetailId == d.Id);

                    bool isExport; // true = NVL (xuất kho), false = Bán thành phẩm/Kính dư (nhập kho)
                    
                    if (hasOutputMappings)
                    {
                        // This detail is an INPUT (raw material) that produces other products
                        isExport = true; // NVL - xuất kho
                    }
                    else if (hasInputMappings)
                    {
                        // This detail is an OUTPUT (semi-finished product) produced from other products
                        isExport = false; // Bán thành phẩm/Kính dư - nhập kho
                    }
                    else
                    {
                        // No mappings: fallback logic
                        // If this product is in ProductionOutputs, it's likely a semi-finished product
                        isExport = !(d.ProductId.HasValue && productionOutputProductIds.Contains(d.ProductId.Value));
                    }

                    var item = new ExportProductsDto
                    {
                        ProductName = d.Product?.ProductName,
                        ProductQuantity = d.Quantity.ToString(),
                        Price = d.Product?.UnitPrice?.ToString()
                    };

                    if (isExport)
                    {
                        // NVL - xuất kho
                        exportDto.ProductsExport.Add(item);
                    }
                    else
                    {
                        // Bán thành phẩm/Kính dư - nhập kho
                        exportDto.ProductsImport.Add(new ImportProductsDto
                        {
                            ProductName = item.ProductName,
                            ProductQuantity = item.ProductQuantity,
                            Price = item.Price
                        });
                    }
                }
            }
            else
            {
                // Chemical export / Glue butyl:
                // Details with ProductId != null are materials (export)
                // Details with ProductId == null and ProductionOutputId set are target products (import)
                
                // Group import products by ProductionOutputId to avoid duplicates
                var importGroups = slip.Details
                    .Where(d => d.ProductId == null && d.ProductionOutputId.HasValue)
                    .GroupBy(d => d.ProductionOutputId.Value)
                    .ToList();
                
                foreach (var group in importGroups)
                {
                    var firstDetail = group.First();
                    // Take quantity from first detail only, don't sum to avoid doubling
                    var quantity = firstDetail.Quantity;
                    var poName = firstDetail.ProductionOutput?.Product?.ProductName ?? 
                                firstDetail.Note?.Replace("Thành phẩm mục tiêu: ", "");
                    
                    exportDto.ProductsImport.Add(new ImportProductsDto
                    {
                        ProductName = poName,
                        ProductQuantity = quantity.ToString(),
                        Price = firstDetail.ProductionOutput?.Product?.UnitPrice?.ToString()
                    });
                }
                
                // Add export products (materials)
                foreach (var d in slip.Details.Where(d => d.ProductId.HasValue))
                {
                    exportDto.ProductsExport.Add(new ExportProductsDto
                    {
                        ProductName = d.Product?.ProductName,
                        ProductQuantity = d.Quantity.ToString(),
                        Price = d.Product?.UnitPrice?.ToString()
                    });
                }
            }

            return exportDto;
        }
    }
}
