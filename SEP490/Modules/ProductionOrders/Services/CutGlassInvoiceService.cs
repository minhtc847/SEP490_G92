using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using System.Collections.Generic;
using System.Linq;
using System.Diagnostics;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class CutGlassInvoiceService : ICutGlassInvoiceService
    {
        private readonly SEP490DbContext _context;
        public CutGlassInvoiceService(SEP490DbContext context)
        {
            _context = context;
        }

        public CutGlassInvoiceDetailDto GetByProductionOrderId(int productionOrderId)
        {
            var productionOrder = _context.ProductionOrders.FirstOrDefault(x => x.Id == productionOrderId && x.Type == "CẮT KÍNH");
            if (productionOrder == null)
            {
                return new CutGlassInvoiceDetailDto
                {
                    BlockName = $"Không tìm thấy lệnh sản xuất hoặc không phải loại CẮT KÍNH",
                    Materials = new List<MaterialBlockDto>()
                };
            }

            var details = _context.ProductionOrderDetails.Where(d => d.ProductionOrder != null && d.ProductionOrder.Id == productionOrderId).ToList();
            var productIds = details.Select(d => d.ProductId).ToList();
            var productsDict = _context.Products.Where(p => productIds.Contains(p.Id)).ToDictionary(p => p.Id, p => p);

            var blocks = new List<MaterialBlockDto>();
            foreach (var detail in details)
            {
                var exportInvoice = _context.ExportInvoices.FirstOrDefault(e => e.ProductionOrderId == productionOrderId && e.Note == detail.Id.ToString());
                if (exportInvoice == null)
                {
                    exportInvoice = new ExportInvoice
                    {
                        ProductionOrderId = productionOrderId,
                        Note = detail.Id.ToString()
                    };
                    _context.ExportInvoices.Add(exportInvoice);
                    _context.SaveChanges();
                }

                // Lay materials và outputs neu da~ co'
                var materialBlocks = _context.CutGlassInvoiceMaterials
                    .Where(m => m.ExportInvoiceId == exportInvoice.Id)
                    .ToList();

                var product = productsDict.ContainsKey(detail.ProductId) ? productsDict[detail.ProductId] : null;
                var productName = product?.ProductName ?? $"SP {detail.ProductId}";
                
                decimal width = 0, height = 0;
                if (product?.Width != null) decimal.TryParse(product.Width, out width);
                if (product?.Height != null) decimal.TryParse(product.Height, out height);

                // Create materials list from database or default
                var materials = new List<MaterialItemDto>();
                if (materialBlocks.Any())
                {
                    foreach (var mat in materialBlocks)
                    {
                        var outputs = _context.CutGlassInvoiceOutputs
                            .Where(x => x.CutGlassInvoiceMaterialId == mat.Id)
                            .ToList();

                        var products = outputs
                            .Where(x => !x.IsDC)
                            .Select(x => new CutGlassItemDto
                            {
                                OutputName = x.OutputName,
                                OutputType = x.OutputType,
                                Quantity = x.Quantity,
                                Width = 0,
                                Height = 0,
                                IsWaste = false
                            }).ToList();
                        
                        Debug.WriteLine($"Loaded {products.Count} products for material {mat.Id}: {string.Join(", ", products.Select(p => p.OutputName))}");

                        var wastes = outputs
                            .Where(x => x.IsDC)
                            .Select(x => new CutGlassItemDto
                            {
                                OutputName = x.OutputName,
                                OutputType = x.OutputType,
                                Quantity = x.Quantity,
                                Width = 0,
                                Height = 0,
                                IsWaste = true
                            }).ToList();

                        // Parse material name to extract dimensions
                        var materialNameParts = ParseMaterialName(mat.materialName);
                        
                        materials.Add(new MaterialItemDto
                        {
                            id = mat.Id,
                            name = materialNameParts.Name,
                            length = materialNameParts.Length,
                            width = materialNameParts.Width,
                            thickness = materialNameParts.Thickness,
                            quantity = mat.quantity.ToString(),
                            products = products,
                            wastes = wastes
                        });
                    }
                }
                else
                {
                    // Create default material from product info
                    materials.Add(new MaterialItemDto
                    {
                        id = 1,
                        name = productName,
                        length = height.ToString(),
                        width = width.ToString(),
                        thickness = (product?.Thickness ?? 0).ToString(),
                        quantity = detail.Quantity.ToString(),
                        products = new List<CutGlassItemDto>(),
                        wastes = new List<CutGlassItemDto>()
                    });
                }
                
                blocks.Add(new MaterialBlockDto
                {
                    materialId = detail.Id,
                    materialName = $"Phiếu cắt kính cho {productName}",
                    width = width,
                    height = height,
                    thickness = product?.Thickness ?? 0,
                    quantity = detail.Quantity,
                    materials = materials
                });
            }

            return new CutGlassInvoiceDetailDto
            {
                BlockName = $"Lệnh sản xuất {productionOrder.ProductionOrderCode ?? productionOrderId.ToString()} - CẮT KÍNH",
                Materials = blocks
            };
        }

        private (string Name, string Length, string Width, string Thickness) ParseMaterialName(string materialName)
        {
            Debug.WriteLine($"Parsing material name: {materialName}");
            
            // Parse material name like "Kính EI60 phút, KT: 300*500*30 mm, VNG-MK c? kính d?ng" to extract dimensions
            var sizeMatch = System.Text.RegularExpressions.Regex.Match(materialName, @"(.+?)\s*[Kk][Tt]:\s*(\d+)\s*[*xX]\s*(\d+)\s*[*xX]\s*(\d+)");
            
            if (sizeMatch.Success)
            {
                var result = (
                    Name: sizeMatch.Groups[1].Value.Trim().TrimEnd(','),
                    Length: sizeMatch.Groups[2].Value,
                    Width: sizeMatch.Groups[3].Value,
                    Thickness: sizeMatch.Groups[4].Value
                );
                Debug.WriteLine($"Parsed successfully: Name={result.Name}, Length={result.Length}, Width={result.Width}, Thickness={result.Thickness}");
                return result;
            }
            
            // Try alternative format like "Kính EI90 300x200x30"
            var altSizeMatch = System.Text.RegularExpressions.Regex.Match(materialName, @"(.+?)\s+(\d+)\s*[xX]\s*(\d+)\s*[xX]\s*(\d+)");
            
            if (altSizeMatch.Success)
            {
                var result = (
                    Name: altSizeMatch.Groups[1].Value.Trim().TrimEnd(','),
                    Length: altSizeMatch.Groups[2].Value,
                    Width: altSizeMatch.Groups[3].Value,
                    Thickness: altSizeMatch.Groups[4].Value
                );
                Debug.WriteLine($"Parsed successfully (alt format): Name={result.Name}, Length={result.Length}, Width={result.Width}, Thickness={result.Thickness}");
                return result;
            }
            
            // If no dimensions found, return the original name
            Debug.WriteLine($"No dimensions found, returning original name: {materialName}");
            return (Name: materialName, Length: "", Width: "", Thickness: "");
        }

        public void SaveCutGlassInvoice(SaveCutGlassInvoiceRequestDto request)
        {
            try
            {
                Debug.WriteLine($"Starting SaveCutGlassInvoice with {request.materials?.Count ?? 0} materials");
                
                foreach (var mat in request.materials)
                {
                    Debug.WriteLine($"Processing material block: MaterialId={mat.materialId}, MaterialName={mat.materialName}, Materials count={mat.materials?.Count ?? 0}");
                    var exportInvoice = _context.ExportInvoices.FirstOrDefault(x => 
                        x.ProductionOrderId == request.productionOrderId && 
                        x.Note == mat.materialId.ToString());
                
                Debug.WriteLine($"Looking for export invoice: ProductionOrderId={request.productionOrderId}, Note={mat.materialId}");
                if (exportInvoice == null)
                {
                    Debug.WriteLine($"Creating new export invoice");
                    exportInvoice = new ExportInvoice
                    {
                        ProductionOrderId = request.productionOrderId,
                        Note = mat.materialId.ToString()
                    };
                    _context.ExportInvoices.Add(exportInvoice);
                    _context.SaveChanges();
                    Debug.WriteLine($"Created export invoice with Id: {exportInvoice.Id}");
                }
                else
                {
                    Debug.WriteLine($"Found existing export invoice with Id: {exportInvoice.Id}");
                }

                // Only delete materials and outputs for this specific material block
                Debug.WriteLine($"Deleting old materials for export invoice {exportInvoice.Id}");
                var oldMaterials = _context.CutGlassInvoiceMaterials.Where(m => m.ExportInvoiceId == exportInvoice.Id).ToList();
                Debug.WriteLine($"Found {oldMaterials.Count} old materials to delete");
                
                foreach (var oldMat in oldMaterials)
                {
                    var oldOutputs = _context.CutGlassInvoiceOutputs.Where(o => o.CutGlassInvoiceMaterialId == oldMat.Id).ToList();
                    Debug.WriteLine($"Deleting {oldOutputs.Count} outputs for material {oldMat.Id}");
                    _context.CutGlassInvoiceOutputs.RemoveRange(oldOutputs);
                }
                _context.CutGlassInvoiceMaterials.RemoveRange(oldMaterials);
                _context.SaveChanges();
                Debug.WriteLine("Deleted old materials and outputs successfully");

                var detail = _context.ProductionOrderDetails.FirstOrDefault(d => d.Id == mat.materialId);
                Debug.WriteLine($"Found detail: {detail?.Id ?? 0}, ProductId: {detail?.ProductId ?? 0}");
                
                var product = detail != null ? _context.Products.FirstOrDefault(p => p.Id == detail.ProductId) : null;
                Debug.WriteLine($"Found product: {product?.ProductName ?? "null"}");
                
                                // Save each material item
                foreach (var materialItem in mat.materials)
                {
                    try
                    {
                        Debug.WriteLine($"Processing material item: Id={materialItem.id}, Name={materialItem.name}, Length={materialItem.length}, Width={materialItem.width}, Thickness={materialItem.thickness}");
                        
                        // Concatenate material name with dimensions
                        var materialNameWithDimensions = $"{materialItem.name}, KT: {materialItem.length}*{materialItem.width}*{materialItem.thickness} mm".Trim();
                        Debug.WriteLine($"Concatenated material name: {materialNameWithDimensions}");
                        
                        var material = new CutGlassInvoiceMaterial
                        {
                            ExportInvoiceId = exportInvoice.Id,
                            materialName = materialNameWithDimensions,
                            materialType = 0,
                            quantity = int.TryParse(materialItem.quantity, out int qty) ? qty : (detail?.Quantity ?? 0),
                            note = string.Empty
                        };
                        
                        Debug.WriteLine($"Created material: Id={material.Id}, Name={material.materialName}, Quantity={material.quantity}");
                        _context.CutGlassInvoiceMaterials.Add(material);
                        _context.SaveChanges();
                        Debug.WriteLine($"Saved material with Id: {material.Id}");

                    // Save products for this material
                    Debug.WriteLine($"Saving {materialItem.products?.Count ?? 0} products for material {material.Id}");
                    foreach (var prod in materialItem.products)
                    {
                        Debug.WriteLine($"  Product: {prod.OutputName}, Type: {prod.OutputType}, Quantity: {prod.Quantity}");
                        var output = new CutGlassInvoiceOutput
                        {
                            CutGlassInvoiceMaterialId = material.Id,
                            OutputName = prod.OutputName,
                            OutputType = prod.OutputType,
                            Quantity = prod.Quantity,
                            IsDC = false,
                            Note = string.Empty
                        };
                        _context.CutGlassInvoiceOutputs.Add(output);
                    }

                    // Save wastes for this material
                    Debug.WriteLine($"Saving {materialItem.wastes?.Count ?? 0} wastes for material {material.Id}");
                    foreach (var waste in materialItem.wastes)
                    {
                        Debug.WriteLine($"  Waste: {waste.OutputName}, Type: {waste.OutputType}, Quantity: {waste.Quantity}");
                        var output = new CutGlassInvoiceOutput
                        {
                            CutGlassInvoiceMaterialId = material.Id,
                            OutputName = waste.OutputName,
                            OutputType = waste.OutputType,
                            Quantity = waste.Quantity,
                            IsDC = true,
                            Note = string.Empty
                        };
                        _context.CutGlassInvoiceOutputs.Add(output);
                    }
                    }
                    catch (Exception ex)
                    {
                        Debug.WriteLine($"Error processing material item {materialItem.id}: {ex.Message}");
                        throw;
                    }
                }
            }
            _context.SaveChanges();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error in SaveCutGlassInvoice: {ex.Message}");
                Debug.WriteLine($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }
    }
} 