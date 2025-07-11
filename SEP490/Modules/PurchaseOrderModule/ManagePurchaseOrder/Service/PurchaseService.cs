using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.OrderModule.ManageOrder.Services;
using SEP490.Modules.PurchaseOrderModule.ManagePurchaseOrder.DTO;
using System;

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

    }
}
