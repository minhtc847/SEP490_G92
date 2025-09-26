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
using SEP490.Selenium.ImportExportInvoice.DTO;

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
                    IsFinalized = false,
                    IsUpdateMisa = false
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
                        }
                    }
                    else
                    {
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
                     var processedMappings = new HashSet<string>();
                    
                     foreach (var mappingDto in mappingInfo.TempMappings)
                     {
                         if (mappingDto.InputDetailId < 0 || mappingDto.InputDetailId >= details.Count ||
                             mappingDto.OutputDetailId < 0 || mappingDto.OutputDetailId >= details.Count)
                         {
                             continue;
                         }
                         
                         var inputDetail = details[mappingDto.InputDetailId];
                         var outputDetail = details[mappingDto.OutputDetailId];
                         
                         if (inputDetail == null || outputDetail == null || inputDetail.Id == outputDetail.Id)
                         {
                             continue;
                         }
                         
                         var mappingKey = $"{inputDetail.Id}_{outputDetail.Id}";
                         if (processedMappings.Contains(mappingKey))
                         {        
                             continue;
                         }
                         
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

                     if (mappings.Any())
                     {
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
                    IsFinalized = false,
                    IsUpdateMisa = false
                };

                _context.InventorySlips.Add(slip);
                await _context.SaveChangesAsync();

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

                 // Add target product (product_id = null) - only if not already in details
                if (dto.ProductionOutputTargets != null && dto.ProductionOutputTargets.Any())
                {
                    foreach (var target in dto.ProductionOutputTargets)
                    {
                        // Check if this production output already has a target detail
                        var existingTargetDetail = details.FirstOrDefault(d => 
                            d.ProductId == null && d.ProductionOutputId == target.ProductionOutputId);
                        
                        if (existingTargetDetail == null)
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
                     // Load all mappings for this slip in one query to improve performance
                     var allDetailIds = slip.Details.Select(d => d.Id).ToList();
                     var allMappings = await _context.MaterialOutputMappings
                         .Include(m => m.InputDetail)
                             .ThenInclude(id => id.Product)
                         .Include(m => m.OutputDetail)
                             .ThenInclude(od => od.Product)
                         .Where(m => allDetailIds.Contains(m.InputDetailId))
                         .ToListAsync();
                     
                     foreach (var detail in slip.Details)
                     {
                         // Load OutputMappings where this detail is the INPUT (raw material)
                         var outputMappings = allMappings
                             .Where(m => m.InputDetailId == detail.Id)
                             .ToList();
                         
                         detail.OutputMappings = outputMappings;
                         
                         // Load InputMappings where this detail is the OUTPUT (created from other products)
                         var inputMappings = allMappings
                             .Where(m => m.OutputDetailId == detail.Id)
                             .ToList();
                         
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
                         // Load mappings ONLY for this specific slip - where both input and output details belong to this slip
                         var allDetailIds = slip.Details.Select(d => d.Id).ToList();
                         var filteredMappings = await _context.MaterialOutputMappings
                             .Include(m => m.InputDetail)
                                 .ThenInclude(id => id.Product)
                             .Include(m => m.OutputDetail)
                                 .ThenInclude(od => od.Product)
                             .Where(m => allDetailIds.Contains(m.InputDetailId) && 
                                       allDetailIds.Contains(m.OutputDetailId))
                             .ToListAsync();
                         
                         // Remove duplicates at the mapping level
                         var uniqueAllMappings = filteredMappings
                             .GroupBy(m => new { m.InputDetailId, m.OutputDetailId })
                             .Select(g => g.First())
                             .ToList();
                         
                         foreach (var detail in slip.Details)
                         {                            
                             // Load OutputMappings where this detail is the INPUT (raw material)
                             var outputMappings = uniqueAllMappings
                                 .Where(m => m.InputDetailId == detail.Id)
                                 .ToList();
                             
                             detail.OutputMappings = outputMappings;
                             
                             // Load InputMappings where this detail is the OUTPUT (created from other products)
                             var inputMappings = uniqueAllMappings
                                 .Where(m => m.OutputDetailId == detail.Id)
                                 .ToList();
                             
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
                
                 // Filter NVL not semi finished product
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
                         ProductType = "Kính dư", // Mark as waste glass
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
                 // Materials slip
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
                Status = (int)(productionOrder.Status ?? ProductionStatus.Pending),
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

            var entitiesToAdd = new List<MaterialOutputMapping>();
            var processedMappings = new HashSet<string>();

            foreach (var mappingDto in mappings)
            {
                var mappingKey = $"{mappingDto.InputDetailId}_{mappingDto.OutputDetailId}";
                
                if (processedMappings.Contains(mappingKey))
                {
                    continue;
                }

                var existingMapping = await _context.MaterialOutputMappings
                    .FirstOrDefaultAsync(m => m.InputDetailId == mappingDto.InputDetailId && 
                                           m.OutputDetailId == mappingDto.OutputDetailId);
                
                if (existingMapping != null)
                {
                    processedMappings.Add(mappingKey);
                    continue;
                }

                var entity = new MaterialOutputMapping
                {
                    InputDetailId = mappingDto.InputDetailId,
                    OutputDetailId = mappingDto.OutputDetailId,
                    Note = mappingDto.Note,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };
                
                entitiesToAdd.Add(entity);
                processedMappings.Add(mappingKey);
            }

            if (entitiesToAdd.Any())
            {
                _context.MaterialOutputMappings.AddRange(entitiesToAdd);
                await _context.SaveChangesAsync();
            }
            else
            {
            }

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
                 // Chemical, glue butyl export
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
                             UOM = "cái", // Default
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
                         OutputMappings = new List<MaterialOutputMappingDto>() // No mapping for material export slips
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
                IsUpdateMisa = slip.IsUpdateMisa,
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
                         
                         // Calculate total input quantity for each target product
                         var targetProductQuantities = new Dictionary<int, decimal>();
                         
                         // Initialize all production outputs with 0 quantity
                         foreach (var po in productionOutputs)
                         {
                             targetProductQuantities[po.Id] = 0;
                         }
                         
                         foreach (var inputDetail in inputDetails)
                         {
                             // Find the corresponding production output for this input material
                             var productionOutput = productionOutputs.FirstOrDefault(po => po.ProductId == inputDetail.ProductId);
                             
                             if (productionOutput != null)
                             {
                                 // This input material contributes to the target product
                                 targetProductQuantities[productionOutput.Id] += inputDetail.Quantity;
                             }
                         }
                         
                         // Update finished quantities for each target product
                         foreach (var kvp in targetProductQuantities)
                         {
                             var productionOutputId = kvp.Key;
                             var quantity = kvp.Value;
                             
                             if (quantity > 0)
                             {
                                 // Get the production output and update directly
                                 var productionOutput = await _context.ProductionOutputs.FindAsync(productionOutputId);
                                 if (productionOutput != null)
                                 {
                                     var oldFinished = productionOutput.Finished ?? 0m;
                                     productionOutput.Finished = oldFinished + quantity;
                                 }
                             }
                         }
                         
                         // Save all changes to ProductionOutputs
                         await _context.SaveChangesAsync();
                     }
                }
                else
                {
                    // For material export/glue, use target product details (ProductId == null)
                    // Group by ProductionOutputId to avoid duplicate updates
                    var targetGroups = slip.Details
                        .Where(d => d.ProductId == null && d.ProductionOutputId.HasValue)
                        .GroupBy(d => d.ProductionOutputId!.Value)
                        .ToList();
                    
                    foreach (var group in targetGroups)
                    {
                        var productionOutputId = group.Key;
                        var totalQuantity = group.Sum(t => t.Quantity);
                        
                        var po = await _context.ProductionOutputs.FirstOrDefaultAsync(po => po.Id == productionOutputId);
                        if (po != null)
                        {
                            var oldFinished = po.Finished ?? 0m;
                            po.Finished = oldFinished + totalQuantity;
                        }
                    }
                    await _context.SaveChangesAsync();
                    
                    if (productionOrder.Type == "Đổ keo")
                    {
                        await UpdateProductionPlanDetailDoneAsync(slip.ProductionOrderId, targetGroups);
                    }
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

                var productionOrder = await _context.ProductionOrders.FirstOrDefaultAsync(po => po.Id == slip.ProductionOrderId);
                if (productionOrder == null) throw new ArgumentException("Không tìm thấy lệnh sản xuất");

                slip.Description = dto.Description;
                slip.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();

                var detailIds = slip.Details.Select(d => d.Id).ToList();
                var oldMappings = await _context.MaterialOutputMappings
                    .Where(m => detailIds.Contains(m.InputDetailId) || detailIds.Contains(m.OutputDetailId))
                    .ToListAsync();
                if (oldMappings.Any()) _context.MaterialOutputMappings.RemoveRange(oldMappings);
                _context.InventorySlipDetails.RemoveRange(slip.Details);
                await _context.SaveChangesAsync();

                var newDetails = new List<InventorySlipDetail>();
                foreach (var detailDto in dto.Details.OrderBy(d => d.SortOrder))
                {
                    int? productionOutputId = detailDto.ProductionOutputId;
                    
                    if (mappingInfo?.ProductClassifications != null && productionOrder.Type == "Cắt kính")
                    {
                        var classification = mappingInfo.ProductClassifications
                            .FirstOrDefault(c => c.ProductId == detailDto.ProductId);
                        
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

                if (mappingInfo?.TempMappings != null && mappingInfo.TempMappings.Any())
                {
                    
                    var processed = new List<MaterialOutputMapping>();
                    
                    var outputDetailsToUpdate = new List<InventorySlipDetail>();
                    
                    foreach (var m in mappingInfo.TempMappings)
                    {
                        var inputDetail = newDetails.ElementAtOrDefault(m.InputDetailId);
                        var outputDetail = newDetails.ElementAtOrDefault(m.OutputDetailId);
                        if (inputDetail == null || outputDetail == null) continue;
                        
                        
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
                    
                    if (productionOrder.Type == "Cắt kính" && outputDetailsToUpdate.Any())
                    {
                        
                        var outputDetailIndices = new HashSet<int>();
                        foreach (var mapping in mappingInfo.TempMappings)
                        {
                            outputDetailIndices.Add(mapping.OutputDetailId);
                        }
                        
                        foreach (var outputDetail in outputDetailsToUpdate.Distinct())
                        {
                            if (outputDetail.ProductId.HasValue)
                            {
                                var detailIndex = newDetails.IndexOf(outputDetail);
                                var isOutputProduct = outputDetailIndices.Contains(detailIndex);
                                
                                if (isOutputProduct)
                                {
                                    var productionOutput = await _context.ProductionOutputs
                                        .FirstOrDefaultAsync(po => po.ProductId == outputDetail.ProductId.Value);
                                    
                                    if (productionOutput != null)
                                    {
                                        var oldProductionOutputId = outputDetail.ProductionOutputId;
                                        outputDetail.ProductionOutputId = productionOutput.Id;
                                    }
                                    else
                                    {
                                    }
                                }
                                else
                                {
                                    if (outputDetail.ProductionOutputId.HasValue)
                                    {
                                        outputDetail.ProductionOutputId = null;
                                    }
                                }
                            }
                        }
                        
                        await _context.SaveChangesAsync();
                        
                        var updatedDetails = await _context.InventorySlipDetails
                            .Where(d => d.InventorySlipId == slip.Id)
                            .ToListAsync();
                        
                        foreach (var detail in updatedDetails.Where(d => d.ProductionOutputId.HasValue))
                        {
                        }
                        
                        var createdMappings = await _context.MaterialOutputMappings
                            .Include(m => m.InputDetail)
                            .Include(m => m.OutputDetail)
                            .Where(m => m.InputDetail.InventorySlipId == slip.Id)
                            .ToListAsync();
                        
                        foreach (var mapping in createdMappings)
                        {
                        }
                    }
                    
                     if (processed.Any())
                     {
                         processed = processed
                             .GroupBy(x => new { x.InputDetailId, x.OutputDetailId })
                             .Select(g => g.First()).ToList();
                         
                         _context.MaterialOutputMappings.AddRange(processed);
                         await _context.SaveChangesAsync();
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
        
        public async Task<ExportDTO> GetExportInfoBySlipIdAsync(int slipId)
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

            var exportDto = new ExportDTO
            {
                EmployeeName = slip.CreatedByEmployee?.FullName
            };

            if (slip.ProductionOrder?.Type == "Cắt kính")
            {
                var productionOutputProductIds = _context.ProductionOutputs
                    .Where(po => po.ProductionOrderId == slip.ProductionOrderId)
                    .Select(po => po.ProductId)
                    .ToList();

                var detailIds = slip.Details.Select(d => d.Id).ToList();
                var mappings = await _context.MaterialOutputMappings
                    .Where(m => detailIds.Contains(m.InputDetailId) || detailIds.Contains(m.OutputDetailId))
                    .ToListAsync();

                foreach (var d in slip.Details.OrderBy(x => x.SortOrder))
                {
                    var hasOutputMappings = mappings.Any(m => m.InputDetailId == d.Id);
                    var hasInputMappings = mappings.Any(m => m.OutputDetailId == d.Id);

                     bool isExport;
                    
                    if (hasOutputMappings)
                    {
                         isExport = true;
                    }
                    else if (hasInputMappings)
                    {
                         isExport = false;
                    }
                    else
                    {
                        isExport = !(d.ProductId.HasValue && productionOutputProductIds.Contains(d.ProductId.Value));
                    }

                    var item = new ExportProductsDTO
                    {
                        ProductName = d.Product?.ProductName,
                        ProductQuantity = d.Quantity.ToString(),
                        Price = d.Product?.UnitPrice?.ToString()
                    };

                     if (isExport)
                     {
                         exportDto.ProductsExport.Add(item);
                     }
                     else
                     {
                         exportDto.ProductsImport.Add(new ImportProductsDTO
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
                var importGroups = slip.Details
                    .Where(d => d.ProductId == null && d.ProductionOutputId.HasValue)
                    .GroupBy(d => d.ProductionOutputId.Value)
                    .ToList();
                
                foreach (var group in importGroups)
                {
                    var firstDetail = group.First();
                    var quantity = firstDetail.Quantity;
                    var poName = firstDetail.ProductionOutput?.Product?.ProductName ?? 
                                firstDetail.Note?.Replace("Thành phẩm mục tiêu: ", "");
                    
                    exportDto.ProductsImport.Add(new ImportProductsDTO
                    {
                        ProductName = poName,
                        ProductQuantity = quantity.ToString(),
                        Price = firstDetail.ProductionOutput?.Product?.UnitPrice?.ToString()
                    });
                }
                
                foreach (var d in slip.Details.Where(d => d.ProductId.HasValue))
                {
                    exportDto.ProductsExport.Add(new ExportProductsDTO
                    {
                        ProductName = d.Product?.ProductName,
                        ProductQuantity = d.Quantity.ToString(),
                        Price = d.Product?.UnitPrice?.ToString()
                    });
                }
            }

            return exportDto;
        }

        public async Task<bool> UpdateMisaStatusAsync(int slipId)
        {
            try
            {
                var slip = await _context.InventorySlips.FindAsync(slipId);
                if (slip == null)
                    return false;

                slip.IsUpdateMisa = true;
                slip.UpdatedAt = DateTime.Now;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<object> CheckSlipProductsMisaStatusAsync(int slipId)
        {
            try
            {
                var exportInfo = await GetExportInfoBySlipIdAsync(slipId);
                if (exportInfo == null)
                    return new { success = false, message = "Không tìm thấy phiếu kho" };

                var allProducts = new List<string>();
                
                allProducts.AddRange(exportInfo.ProductsExport.Select(p => p.ProductName).Where(name => !string.IsNullOrEmpty(name)));
                
                allProducts.AddRange(exportInfo.ProductsImport.Select(p => p.ProductName).Where(name => !string.IsNullOrEmpty(name)));

                if (!allProducts.Any())
                    return new { success = false, message = "Phiếu kho không có sản phẩm nào" };

                var uniqueProducts = allProducts.Distinct().ToList();

                var productsWithMisaStatus = new List<object>();
                var notUpdatedProducts = new List<object>();

                foreach (var productName in uniqueProducts)
                {
                    var product = await _context.Products
                        .FirstOrDefaultAsync(p => p.ProductName == productName);

                    if (product != null)
                    {
                        var productInfo = new
                        {
                            ProductName = productName,
                            ProductCode = product.ProductCode ?? "",
                            IsUpdateMisa = product.isupdatemisa == 1
                        };

                        productsWithMisaStatus.Add(productInfo);

                        if (product.isupdatemisa==0)
                        {
                            notUpdatedProducts.Add(productInfo);
                        }
                    }
                    else
                    {
                        var productInfo = new
                        {
                            ProductName = productName,
                            ProductCode = "",
                            IsUpdateMisa = false
                        };

                        productsWithMisaStatus.Add(productInfo);
                        notUpdatedProducts.Add(productInfo);
                    }
                }

                var totalProducts = productsWithMisaStatus.Count;
                var updatedProducts = productsWithMisaStatus.Count(p => 
                {
                    var isUpdateMisa = p.GetType().GetProperty("IsUpdateMisa")?.GetValue(p);
                    return isUpdateMisa is bool boolValue && boolValue;
                });
                var canUpdateMisa = totalProducts > 0 && updatedProducts == totalProducts;

                return new
                {
                    success = true,
                    canUpdateMisa = canUpdateMisa,
                    totalProducts = totalProducts,
                    updatedProducts = updatedProducts,
                    notUpdatedProducts = notUpdatedProducts,
                    message = canUpdateMisa 
                        ? "Tất cả sản phẩm đã được cập nhật MISA. Có thể tiến hành cập nhật phiếu kho."
                        : $"Có {notUpdatedProducts.Count} sản phẩm chưa được cập nhật MISA. Vui lòng cập nhật MISA cho tất cả sản phẩm trước."
                };
            }
            catch (Exception ex)
            {
                return new { success = false, message = $"Lỗi khi kiểm tra trạng thái MISA: {ex.Message}" };
            }
        }

        private async Task UpdateProductionPlanDetailDoneAsync(int productionOrderId, List<IGrouping<int, InventorySlipDetail>> targetGroups)
        {
            try
            {
                var productionOrder = await _context.ProductionOrders
                    .FirstOrDefaultAsync(po => po.Id == productionOrderId);
                
                if (productionOrder == null)
                {
                    return;
                }

                var productionPlanDetails = await _context.ProductionPlanDetails
                    .Where(ppd => ppd.ProductionPlanId == productionOrder.ProductionPlanId)
                    .ToListAsync();

                if (!productionPlanDetails.Any())
                {
                    return;
                }

                foreach (var group in targetGroups)
                {
                    var productionOutputId = group.Key;
                    var totalQuantity = group.Sum(t => t.Quantity);                    
                    
                    var productionOutput = await _context.ProductionOutputs
                        .FirstOrDefaultAsync(po => po.Id == productionOutputId);
                    
                    if (productionOutput != null)
                    {
                        var planDetail = productionPlanDetails
                            .FirstOrDefault(ppd => ppd.ProductId == productionOutput.ProductId);
                        
                        if (planDetail != null)
                        {
                            var oldDone = planDetail.Done;
                            planDetail.Done += (int)totalQuantity; 
                            
                        }
                        else
                        {
                        }
                    }
                    else
                    {
                    }
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                throw;
            }
        }
    }
}
