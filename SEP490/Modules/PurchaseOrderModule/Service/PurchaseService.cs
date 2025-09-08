using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.Modules.OrderModule.ManageOrder.Services;
using SEP490.Modules.PurchaseOrderModule.DTO;
using System;
using System.Text.RegularExpressions;

namespace SEP490.Modules.PurchaseOrderModule.Service
{
    public class PurchaseService : BaseScopedService, IPurchaseOrderService
    {
        private readonly SEP490DbContext _context;
        private readonly IOrderService _orderService;

        public PurchaseService(SEP490DbContext context, IOrderService orderService)
        {
            _context = context;
            _orderService = orderService;
        }

        public async Task<List<PurchaseOrderDto>> GetAllPurchaseOrdersAsync()
        {
            return await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.Customer)
                .Include(po => po.Employee)
                .Include(po => po.PurchaseOrderDetails)
                .OrderByDescending(po => po.Id)
                .Select(po => new PurchaseOrderDto
                {
                    Id = po.Id,
                    Code = po.Code,
                    Date = po.Date,
                    Description = po.Description,
                    TotalValue = po.PurchaseOrderDetails != null ? po.PurchaseOrderDetails.Sum(d => d.TotalPrice ?? 0) : 0,
                    Status = po.Status.HasValue ? po.Status.Value.ToString() : null,
                    SupplierName = po.Supplier != null ? po.Supplier.CustomerName : null,
                    CustomerName = po.Customer != null ? po.Customer.CustomerName : null,
                    EmployeeName = po.Employee != null ? po.Employee.FullName : null,
                    IsUpdateMisa = po.IsUpdateMisa
                })
                .ToListAsync();
        }

        public async Task<PurchaseOrderWithDetailsDto?> GetPurchaseOrderByIdAsync(int id)
        {
            var order = await _context.PurchaseOrders
                .Include(po => po.Supplier)
                .Include(po => po.Customer)
                .Include(po => po.Employee)
                .Include(po => po.PurchaseOrderDetails)
                    .ThenInclude(d => d.Product)
                        .ThenInclude(p => p.GlassStructure)
                .FirstOrDefaultAsync(po => po.Id == id);

            if (order == null) return null;

            return new PurchaseOrderWithDetailsDto
            {
                Id = order.Id,
                Code = order.Code,
                Date = order.Date,
                Description = order.Description,
                TotalValue = order.PurchaseOrderDetails != null ? order.PurchaseOrderDetails.Sum(d => d.TotalPrice ?? 0) : 0,
                Status = order.Status.HasValue ? order.Status.Value.ToString() : null,
                SupplierName = order.Supplier?.CustomerName,
                CustomerName = order.Customer?.CustomerName,
                CustomerId = order.CustomerId ?? 0,
                EmployeeName = order.Employee?.FullName,
                IsUpdateMisa = order.IsUpdateMisa,
                PurchaseOrderDetails = order.PurchaseOrderDetails.Select(d => new PurchaseOrderDetailDto
                {
                    ProductId = d.ProductId,
                    ProductCode = d.Product?.ProductCode,
                    ProductName = d.Product?.ProductName ?? d.ProductName,
                    ProductType = d.Product?.ProductType,
                    UOM = d.Product?.UOM,
                    Height = d.Product?.Height,
                    Width = d.Product?.Width,
                    Thickness = d.Product?.Thickness,
                    Weight = d.Product?.Weight,

                    GlassStructureId = d.Product?.GlassStructureId,
                    GlassStructureName = d.Product?.GlassStructure?.ProductName,

                    Quantity = d.Quantity,
                    UnitPrice = d.UnitPrice,
                    TotalPrice = d.TotalPrice
                }).ToList()
            };
        }

        public async Task<int> CreatePurchaseOrderAsync(CreatePurchaseOrderDto dto)
        {
            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.CustomerName == dto.CustomerName && c.IsSupplier);



            if (customer == null)
            {
                customer = new Customer
                {
                    CustomerName = dto.CustomerName,
                    IsSupplier = true
                };
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();         
            }

            var order = new PurchaseOrder
            {
                CustomerId = customer.Id,
                Code = string.IsNullOrWhiteSpace(dto.Code) ? GetNextPurchaseOrderCode() : dto.Code,
                Date = dto.Date,
                Description = dto.Description,
                //Status = dto.Status
            };
            _context.PurchaseOrders.Add(order);
            await _context.SaveChangesAsync();       

            decimal totalOrderValue = 0m;

            foreach (var p in dto.Products)
            {

                var product = await _context.Products.FirstOrDefaultAsync(x => x.ProductName == p.ProductName);
                if (product == null)
                {
                    throw new InvalidOperationException($"Product '{p.ProductName}' does not exist");
                }

                var detail = new PurchaseOrderDetail
                {
                    PurchaseOrderId = order.Id,
                    ProductName = p.ProductName,
                    Unit = p.UOM ?? "Tấm",
                    Quantity = p.Quantity,
                    UnitPrice = p.UnitPrice,
                    TotalPrice = p.TotalPrice,
                    ProductId = product.Id
                };
                _context.PurchaseOrderDetails.Add(detail);

                totalOrderValue += p.TotalPrice;
            }

            order.TotalValue = totalOrderValue;
            await _context.SaveChangesAsync();
            return order.Id;
        }


        public async Task<bool> DeletePurchaseOrderAsync(int id)
        {
            var order = await _context.PurchaseOrders
                .Include(po => po.PurchaseOrderDetails) 
                .FirstOrDefaultAsync(po => po.Id == id);

            if (order == null)
                return false;

            if (order.PurchaseOrderDetails != null && order.PurchaseOrderDetails.Any())
            {
                _context.PurchaseOrderDetails.RemoveRange(order.PurchaseOrderDetails);
            }

            _context.PurchaseOrders.Remove(order);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> UpdatePurchaseOrderAsync(int id, UpdatePurchaseOrderDto dto)
        {
            var order = await _context.PurchaseOrders
                .Include(po => po.PurchaseOrderDetails)
                .FirstOrDefaultAsync(po => po.Id == id);

            if (order == null)
                return false;

            var customer = await _context.Customers.FirstOrDefaultAsync(c => c.CustomerName == dto.CustomerName);
            if (customer == null)
            {
                customer = new Customer { CustomerName = dto.CustomerName };
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
            }

            order.CustomerId = customer.Id;
            order.Description = dto.Description;
            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                if (Enum.TryParse<PurchaseStatus>(dto.Status, ignoreCase: true, out var parsedStatus))
                {
                    order.Status = parsedStatus;
                }
                else
                {
                    throw new Exception($"Trạng thái '{dto.Status}' không hợp lệ. Các giá trị hợp lệ là: {string.Join(", ", Enum.GetNames(typeof(PurchaseStatus)))}");
                }
            }
            order.Date = DateTime.Now; 

            _context.PurchaseOrderDetails.RemoveRange(order.PurchaseOrderDetails);

            decimal updatedTotalValue = 0m;

            foreach (var p in dto.Products)
            {
                Product? product = null;

                if (p.ProductId.HasValue)
                {
                    product = await _context.Products.FindAsync(p.ProductId.Value);
                }

                if (product == null)
                {
                    product = new Product
                    {
                        ProductName = p.ProductName,
                        Width = p.Width?.ToString(),
                        Height = p.Height?.ToString(),
                        Thickness = p.Thickness,
                        UOM = p.UOM ?? "Tấm",
                        ProductType = "NVL",
                        isupdatemisa = false
                    };
                    _context.Products.Add(product);
                    await _context.SaveChangesAsync();
                }

                var detail = new PurchaseOrderDetail
                {
                    PurchaseOrderId = order.Id,
                    ProductId = product.Id,
                    ProductName = p.ProductName,
                    Unit = p.UOM ?? "Tấm",
                    Quantity = p.Quantity,
                    UnitPrice = p.UnitPrice,
                    TotalPrice = p.TotalPrice
                };
                _context.PurchaseOrderDetails.Add(detail);

                updatedTotalValue += p.TotalPrice;
            }

            order.TotalValue = updatedTotalValue;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Product> CreateProductAsync(CreateProductV3Dto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ProductName))
                throw new Exception("Tên sản phẩm là bắt buộc.");
            if (string.IsNullOrWhiteSpace(dto.UOM))
                throw new Exception("Đơn vị tính (UOM) là bắt buộc.");

            bool isNameExisted = await _context.Products.AnyAsync(p => p.ProductName == dto.ProductName);
            if (isNameExisted)
                throw new Exception("Tên sản phẩm đã tồn tại!");

            var product = new Product
            {
                ProductCode = null,
                ProductName = dto.ProductName,
                ProductType = dto.ProductType ?? "NVL",
                UOM = dto.UOM,
                Width = dto.Width,
                Height = dto.Height,
                Thickness = dto.Thickness,
                Weight = dto.Weight,
                UnitPrice = dto.UnitPrice,
                GlassStructureId = dto.GlassStructureId,
                isupdatemisa = dto.isupdatemisa
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public string GetNextPurchaseOrderCode()
        {
            var codes = _context.PurchaseOrders
                .Where(po => EF.Functions.Like(po.Code, "MH%"))
                .Select(po => po.Code!)
                .ToList();

            int maxNumber = 0;

            foreach (var code in codes)
            {
                var match = Regex.Match(code, @"MH(\d+)");
                if (match.Success && int.TryParse(match.Groups[1].Value, out int number))
                {
                    if (number > maxNumber)
                        maxNumber = number;
                }
            }

            int nextNumber = maxNumber + 1;
            return $"MH{nextNumber:D5}";
        }

        public async Task<bool> UpdatePurchaseOrderStatusAsync(int orderId, PurchaseStatus status)
        {
            var order = await _context.PurchaseOrders.FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null) return false;

            order.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ImportPurchaseOrderAsync(int orderId)
        {
            var order = await _context.PurchaseOrders
                .Include(po => po.PurchaseOrderDetails)
                .ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(po => po.Id == orderId);

            if (order == null || order.Status == PurchaseStatus.Imported)
                return false;

            foreach (var detail in order.PurchaseOrderDetails)
            {
                if (detail.ProductId.HasValue && detail.Quantity.HasValue)
                {
                    var product = await _context.Products.FindAsync(detail.ProductId.Value);
                    if (product != null)
                    {
                        product.quantity += detail.Quantity.Value;
                    }
                }
            }

            order.Status = PurchaseStatus.Imported;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateMisaPurchaseOrderAsync(int orderId)
        {
            var order = await _context.PurchaseOrders.FirstOrDefaultAsync(po => po.Id == orderId);
            if (order == null)
                return false;

            order.IsUpdateMisa = true;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<(bool IsValid, string Message)> ValidateProductsForMisaUpdateAsync(int orderId)
        {
            var order = await _context.PurchaseOrders
                .Include(po => po.PurchaseOrderDetails)
                .ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(po => po.Id == orderId);

            if (order == null)
                return (false, "Purchase order not found.");

            if (order.PurchaseOrderDetails == null || !order.PurchaseOrderDetails.Any())
                return (false, "Purchase order has no products.");

            var productsNotUpdated = order.PurchaseOrderDetails
                .Where(d => d.ProductId.HasValue && d.Product != null && !d.Product.isupdatemisa)
                .Select(d => d.Product?.ProductName ?? "Unknown Product")
                .ToList();

            if (productsNotUpdated.Any())
            {
                var productNames = string.Join(", ", productsNotUpdated);
                return (false, $"The following products have not been updated to MISA yet: {productNames}. Please update these products to MISA first before updating the purchase order.");
            }

            return (true, "All products are ready for MISA update.");
        }

    }
}
