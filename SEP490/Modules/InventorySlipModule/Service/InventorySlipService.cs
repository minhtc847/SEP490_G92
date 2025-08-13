using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.InventorySlipModule.DTO;

namespace SEP490.Modules.InventorySlipModule.Service
{
    public class InventorySlipService : IInventorySlipService
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

        public async Task<InventorySlipDto> CreateCutGlassSlipAsync(CreateInventorySlipDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create main slip
                var slip = new InventorySlip
                {
                    SlipCode = await GenerateSlipCodeAsync(dto.ProductionOrderId, dto.TransactionType),
                    SlipDate = DateTime.Now,
                    TransactionType = Enum.Parse<TransactionType>(dto.TransactionType),
                    Description = dto.Description,
                    ProductionOrderId = dto.ProductionOrderId,
                    CreatedBy = 1, // TODO: Get from current user context
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.InventorySlips.Add(slip);
                await _context.SaveChangesAsync();

                // Create details
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

                _context.InventorySlipDetails.AddRange(details);
                await _context.SaveChangesAsync();

                // Create mappings if provided
                if (dto.Mappings != null && dto.Mappings.Any())
                {
                    var mappings = new List<MaterialOutputMapping>();
                    foreach (var mappingDto in dto.Mappings)
                    {
                        var mapping = new MaterialOutputMapping
                        {
                            InputDetailId = mappingDto.InputDetailId,
                            OutputDetailId = mappingDto.OutputDetailId,
                            Note = mappingDto.Note,
                            CreatedAt = DateTime.Now,
                            UpdatedAt = DateTime.Now
                        };
                        mappings.Add(mapping);
                    }

                    _context.MaterialOutputMappings.AddRange(mappings);
                    await _context.SaveChangesAsync();
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

        public async Task<InventorySlipDto> CreateChemicalExportSlipAsync(CreateInventorySlipDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create main slip
                var slip = new InventorySlip
                {
                    SlipCode = await GenerateSlipCodeAsync(dto.ProductionOrderId, dto.TransactionType),
                    SlipDate = DateTime.Now,
                    TransactionType = Enum.Parse<TransactionType>(dto.TransactionType),
                    Description = dto.Description,
                    ProductionOrderId = dto.ProductionOrderId,
                    CreatedBy = 1, // TODO: Get from current user context
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now
                };

                _context.InventorySlips.Add(slip);
                await _context.SaveChangesAsync();

                // Create details
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
            // Similar to chemical export slip
            return await CreateChemicalExportSlipAsync(dto);
        }

        public async Task<InventorySlipDto> GetInventorySlipByIdAsync(int id)
        {
            var slip = await _context.InventorySlips
                .Include(s => s.ProductionOrder)
                .Include(s => s.CreatedByEmployee)
                .Include(s => s.Details)
                    .ThenInclude(d => d.Product)
                .Include(s => s.Details)
                    .ThenInclude(d => d.ProductionOutput)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (slip == null) return null;

            return MapToDto(slip);
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

            return slips.Select(MapToDto).ToList();
        }

        public async Task<List<InventorySlipDto>> GetInventorySlipsByProductionOrderAsync(int productionOrderId)
        {
            var slips = await _context.InventorySlips
                .Include(s => s.ProductionOrder)
                .Include(s => s.CreatedByEmployee)
                .Include(s => s.Details)
                    .ThenInclude(d => d.Product)
                .Where(s => s.ProductionOrderId == productionOrderId)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            return slips.Select(MapToDto).ToList();
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
                    Console.WriteLine($"DeleteInventorySlipAsync: Slip with ID {id} not found");
                    return false;
                }

                Console.WriteLine($"DeleteInventorySlipAsync: Found slip {id} with {slip.Details.Count} details");

                // Delete related mappings first
                var detailIds = slip.Details.Select(d => d.Id).ToList();
                var mappings = await _context.MaterialOutputMappings
                    .Where(m => detailIds.Contains(m.InputDetailId) || detailIds.Contains(m.OutputDetailId))
                    .ToListAsync();
                
                Console.WriteLine($"DeleteInventorySlipAsync: Found {mappings.Count} mappings to delete");
                
                if (mappings.Any())
                {
                    _context.MaterialOutputMappings.RemoveRange(mappings);
                }

                // Delete details
                _context.InventorySlipDetails.RemoveRange(slip.Details);
                
                // Delete main slip
                _context.InventorySlips.Remove(slip);
                
                var result = await _context.SaveChangesAsync();
                Console.WriteLine($"DeleteInventorySlipAsync: SaveChanges result: {result} rows affected");
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DeleteInventorySlipAsync: Exception occurred: {ex.Message}");
                Console.WriteLine($"DeleteInventorySlipAsync: Stack trace: {ex.StackTrace}");
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
                        return null; // Not found anywhere
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

                // Glass products (existing glass that can be reused)
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
                // For chemical export and glue butyl export: use existing logic
                var availableProducts = await _context.ProductionOutputs
                    .Include(po => po.Product)
                    .Where(po => po.ProductionOrderId == productionOrderId)
                    .Select(po => po.Product)
                    .Distinct()
                    .ToListAsync();

                // Also add some common raw materials
                var rawMaterialsFromDb = await _context.Products
                    .Where(p => p.ProductType == "Nguyên vật liệu" || p.ProductType == "Kính")
                    .ToListAsync();

                // Combine and remove duplicates
                var allProducts = new List<Product>();
                allProducts.AddRange(availableProducts);
                
                foreach (var raw in rawMaterialsFromDb)
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
                return false;

            var productionOrder = await _context.ProductionOrders
                .FirstOrDefaultAsync(po => po.Id == dto.ProductionOrderId);
            
            if (productionOrder == null)
                return false;

            return true;
        }

        public async Task<string> GenerateSlipCodeAsync(int productionOrderId, string transactionType)
        {
            var productionOrder = await _context.ProductionOrders
                .FirstOrDefaultAsync(po => po.Id == productionOrderId);
            
            var prefix = transactionType == "Out" ? "XK" : "NK";
            var date = DateTime.Now.ToString("yyyyMMdd");
            var count = await _context.InventorySlips
                .CountAsync(s => s.ProductionOrderId == productionOrderId && s.TransactionType == Enum.Parse<TransactionType>(transactionType));
            
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
                quantity = 0 // Start with 0 quantity
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
                existingSlip.TransactionType = Enum.Parse<TransactionType>(dto.TransactionType);
                existingSlip.UpdatedAt = DateTime.Now;

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

                // Remove existing mappings
                var existingMappings = await _context.MaterialOutputMappings
                    .Where(m => existingSlip.Details.Select(d => d.Id).Contains(m.InputDetailId) || 
                               existingSlip.Details.Select(d => d.Id).Contains(m.OutputDetailId))
                    .ToListAsync();

                if (existingMappings.Any())
                {
                    _context.MaterialOutputMappings.RemoveRange(existingMappings);
                }

                // Create new mappings if provided
                if (dto.Mappings != null && dto.Mappings.Any())
                {
                    var mappings = new List<MaterialOutputMapping>();
                    foreach (var mappingDto in dto.Mappings)
                    {
                        // Find the new detail IDs by matching product IDs
                        var inputDetail = details.FirstOrDefault(d => d.ProductId == dto.Details[mappingDto.InputDetailId].ProductId);
                        var outputDetail = details.FirstOrDefault(d => d.ProductId == dto.Details[mappingDto.OutputDetailId].ProductId);
                        
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
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GetInventorySlipByIdAsync(existingSlip.Id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private InventorySlipDto MapToDto(InventorySlip slip)
        {
            return new InventorySlipDto
            {
                Id = slip.Id,
                SlipCode = slip.SlipCode,
                SlipDate = slip.SlipDate,
                TransactionType = slip.TransactionType.ToString(),
                Description = slip.Description,
                ProductionOrderId = slip.ProductionOrderId,
                ProductionOrderCode = slip.ProductionOrder?.ProductionOrderCode,
                ProductionOrderType = slip.ProductionOrder?.Type,
                CreatedBy = slip.CreatedBy,
                CreatedByEmployeeName = slip.CreatedByEmployee?.FullName ?? "Employee " + slip.CreatedBy,
                CreatedAt = slip.CreatedAt,
                UpdatedAt = slip.UpdatedAt,
                Details = slip.Details.Select(d => new InventorySlipDetailDto
                {
                    Id = d.Id,
                    ProductId = d.ProductId,
                    ProductCode = d.Product?.ProductCode,
                    ProductName = d.Product?.ProductName,
                    ProductType = d.Product?.ProductType,
                    UOM = d.Product?.UOM,
                    Quantity = d.Quantity,
                    Note = d.Note,
                    SortOrder = d.SortOrder,
                    ProductionOutputId = d.ProductionOutputId
                }).ToList()
            };
        }
    }
}
