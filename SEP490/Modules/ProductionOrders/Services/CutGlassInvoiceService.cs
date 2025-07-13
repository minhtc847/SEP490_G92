using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;
using System.Collections.Generic;
using System.Linq;

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

                var products = new List<CutGlassItemDto>();
                var wastes = new List<CutGlassItemDto>();
                foreach (var mat in materialBlocks)
                {
                    var outputs = _context.CutGlassInvoiceOutputs
                        .Where(x => x.CutGlassInvoiceMaterialId == mat.Id)
                        .ToList();

                    products.AddRange(outputs
                        .Where(x => !x.IsDC)
                        .Select(x => new CutGlassItemDto
                        {
                            OutputName = x.OutputName,
                            OutputType = x.OutputType,
                            Quantity = x.Quantity,
                            Width = 0,
                            Height = 0,
                            IsWaste = false
                        }));

                    wastes.AddRange(outputs
                        .Where(x => x.IsDC)
                        .Select(x => new CutGlassItemDto
                        {
                            OutputName = x.OutputName,
                            OutputType = x.OutputType,
                            Quantity = x.Quantity,
                            Width = 0,
                            Height = 0,
                            IsWaste = true
                        }));
                }

                var product = productsDict.ContainsKey(detail.ProductId) ? productsDict[detail.ProductId] : null;
                var productName = product?.ProductName ?? $"SP {detail.ProductId}";
                
                decimal width = 0, height = 0;
                if (product?.Width != null) decimal.TryParse(product.Width, out width);
                if (product?.Height != null) decimal.TryParse(product.Height, out height);
                
                blocks.Add(new MaterialBlockDto
                {
                    MaterialId = detail.Id,
                    MaterialName = $"Phiếu cắt kính {productName}",
                    Width = width,
                    Height = height,
                    Thickness = product?.Thickness ?? 0,
                    Quantity = detail.Quantity,
                    Products = products,
                    Wastes = wastes
                });
            }

            return new CutGlassInvoiceDetailDto
            {
                BlockName = $"Lệnh sản xuất {productionOrder.ProductionOrderCode ?? productionOrderId.ToString()} - CẮT KÍNH",
                Materials = blocks
            };
        }

        public void SaveCutGlassInvoice(SaveCutGlassInvoiceRequestDto request)
        {
            foreach (var mat in request.Materials)
            {
                var exportInvoice = _context.ExportInvoices.FirstOrDefault(x => 
                    x.ProductionOrderId == request.ProductionOrderId && 
                    x.Note == mat.MaterialId.ToString());
                
                if (exportInvoice == null)
                {
                    exportInvoice = new ExportInvoice
                    {
                        ProductionOrderId = request.ProductionOrderId,
                        Note = mat.MaterialId.ToString()
                    };
                    _context.ExportInvoices.Add(exportInvoice);
                    _context.SaveChanges();
                }

                var oldMaterials = _context.CutGlassInvoiceMaterials.Where(m => m.ExportInvoiceId == exportInvoice.Id).ToList();
                foreach (var oldMat in oldMaterials)
                {
                    var oldOutputs = _context.CutGlassInvoiceOutputs.Where(o => o.CutGlassInvoiceMaterialId == oldMat.Id).ToList();
                    _context.CutGlassInvoiceOutputs.RemoveRange(oldOutputs);
                }
                _context.CutGlassInvoiceMaterials.RemoveRange(oldMaterials);
                _context.SaveChanges();

                var detail = _context.ProductionOrderDetails.FirstOrDefault(d => d.Id == mat.MaterialId);
                var product = detail != null ? _context.Products.FirstOrDefault(p => p.Id == detail.ProductId) : null;
                var productName = product?.ProductName ?? $"Material {mat.MaterialId}";

                var material = new CutGlassInvoiceMaterial
                {
                    ExportInvoiceId = exportInvoice.Id,
                    materialName = productName,
                    materialType = 0, 
                    quantity = detail?.Quantity ?? 0,
                    note = string.Empty
                };
                _context.CutGlassInvoiceMaterials.Add(material);
                _context.SaveChanges(); 


                foreach (var prod in mat.Products)
                {
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
                

                foreach (var waste in mat.Wastes)
                {
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
            _context.SaveChanges();
        }
    }
} 