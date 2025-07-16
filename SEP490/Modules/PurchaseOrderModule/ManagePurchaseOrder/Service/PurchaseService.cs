using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.Modules.OrderModule.ManageOrder.Services;
using SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.DTO;
using System;
using System.Text.RegularExpressions;

namespace SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.Service
{
    public class PurchaseService : BaseService, IPurchaseOrderService
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
                .Select(po => new PurchaseOrderDto
                {
                    Id = po.Id,
                    Code = po.Code,
                    Date = po.Date,
                    Description = po.Description,
                    TotalValue = po.TotalValue,
                    Status = po.Status,
                    SupplierName = po.Supplier != null ? po.Supplier.CustomerName : null,
                    CustomerName = po.Customer != null ? po.Customer.CustomerName : null,
                    EmployeeName = po.Employee != null ? po.Employee.FullName : null
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
                TotalValue = order.TotalValue,
                Status = order.Status,
                SupplierName = order.Supplier?.CustomerName,
                CustomerName = order.Customer?.CustomerName,
                EmployeeName = order.Employee?.FullName,
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
                .FirstOrDefaultAsync(c => c.CustomerName == dto.CustomerName);

            if (customer == null)
            {
                customer = new Customer
                {
                    CustomerName = dto.CustomerName
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
                Status = dto.Status
            };
            _context.PurchaseOrders.Add(order);
            await _context.SaveChangesAsync();       

            foreach (var p in dto.Products)
            {
                var detail = new PurchaseOrderDetail
                {
                    PurchaseOrderId = order.Id,
                    ProductName = p.ProductName,
                    Unit = "Tấm",
                    Quantity = p.Quantity,

                    Product = new Product
                    {
                        ProductName = p.ProductName,
                        Width = p.Width.ToString(),
                        Height = p.Height.ToString(),
                        Thickness = p.Thickness,
                        UOM = "Tấm",
                        ProductType = "NVL"
                    }
                };
                _context.PurchaseOrderDetails.Add(detail);
            }

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
            order.Status = dto.Status;
            order.Date = DateTime.Now; 

            _context.PurchaseOrderDetails.RemoveRange(order.PurchaseOrderDetails);

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
                        UOM = "Tấm",
                        ProductType = "NVL"
                    };
                    _context.Products.Add(product);
                    await _context.SaveChangesAsync();
                }

                var detail = new PurchaseOrderDetail
                {
                    PurchaseOrderId = order.Id,
                    ProductId = product.Id,
                    ProductName = p.ProductName,
                    Unit = "Tấm",
                    Quantity = p.Quantity,
                    UnitPrice = 0
                };
                _context.PurchaseOrderDetails.Add(detail);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Product> CreateProductAsync(CreateProductV3Dto dto)
        {
            bool isNameExisted = await _context.Products.AnyAsync(p => p.ProductName == dto.ProductName);
            if (isNameExisted)
                throw new Exception("Tên sản phẩm đã tồn tại!");

            if (!decimal.TryParse(dto.Width, out var widthMm) || !decimal.TryParse(dto.Height, out var heightMm))
                throw new Exception("Chiều rộng hoặc chiều cao không hợp lệ.");

            var area = (widthMm * heightMm) / 1_000_000m;



            var product = new Product
            {
                ProductCode = null,
                ProductName = dto.ProductName,
                ProductType = dto.ProductType ?? "nvl",
                UOM = dto.UOM ?? "Tấm",
                Width = dto.Width,
                Height = dto.Height,
                Thickness = dto.Thickness,
                Weight = null, 
                UnitPrice = null,
                GlassStructureId = null,
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

    }
}
