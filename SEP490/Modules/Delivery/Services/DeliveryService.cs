using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Delivery.DTO;

namespace SEP490.Modules.Delivery.Services
{
    public interface IDeliveryService
    {
        Task<List<DeliveryDto>> GetAllDeliveriesAsync();
        Task<List<DeliveryValidationItem>> GetProductionPlanValidationAsync(int salesOrderId);
        Task<DB.Models.Delivery> CreateDeliveryAsync(CreateDeliveryDto dto);
    }

    public class DeliveryService : BaseService, IDeliveryService
    {
        private readonly SEP490DbContext _context;

        public DeliveryService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<List<DeliveryDto>> GetAllDeliveriesAsync()
        {
            var deliveries = await _context.Deliveries
                .Include(d => d.SalesOrder)
                .ThenInclude(so => so.Customer)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return deliveries.Select(d => new DeliveryDto
            {
                Id = d.Id,
                SalesOrderId = d.SalesOrderId,
                OrderCode = d.SalesOrder?.OrderCode ?? "",
                CustomerName = d.SalesOrder?.Customer?.CustomerName ?? "",
                DeliveryDate = d.DeliveryDate,
                ExportDate = d.ExportDate,
                Status = d.Status,
                Note = d.Note,
                CreatedAt = d.CreatedAt,

                TotalAmount = d.SalesOrder?.OrderValue ?? 0
            }).ToList();
        }

        public async Task<List<DeliveryValidationItem>> GetProductionPlanValidationAsync(int salesOrderId)
        {
            var validationItems = new List<DeliveryValidationItem>();

            // Find production plan for the sales order
            var productionPlan = await _context.ProductionPlans
                .Include(p => p.ProductionPlanDetails)
                .ThenInclude(pd => pd.Product)
                .FirstOrDefaultAsync(p => p.SaleOrderId == salesOrderId);

            if (productionPlan == null)
            {
                return validationItems;
            }

            // Get validation info for all products in the production plan
            foreach (var planDetail in productionPlan.ProductionPlanDetails)
            {
                var validationItem = new DeliveryValidationItem
                {
                    ProductId = planDetail.ProductId,
                    ProductName = planDetail.Product?.ProductName ?? $"Sản phẩm {planDetail.ProductId}",
                    RequestedQuantity = 0, // Will be set by frontend
                    AvailableQuantity = planDetail.Done
                };

                validationItems.Add(validationItem);
            }

            return validationItems;
        }

        public async Task<DB.Models.Delivery> CreateDeliveryAsync(CreateDeliveryDto dto)
        {
            // Basic validation - check if production plan exists
            var productionPlan = await _context.ProductionPlans
                .Include(p => p.ProductionPlanDetails)
                .FirstOrDefaultAsync(p => p.SaleOrderId == dto.SalesOrderId);

            if (productionPlan == null)
            {
                throw new InvalidOperationException("Không tìm thấy kế hoạch sản xuất cho đơn hàng này");
            }

            // Create delivery
            var delivery = new DB.Models.Delivery
            {
                SalesOrderId = dto.SalesOrderId,
                DeliveryDate = dto.DeliveryDate,
                ExportDate = dto.ExportDate,
                Status = dto.Status,
                Note = dto.Note,
                CreatedAt = DateTime.Now
            };

            _context.Deliveries.Add(delivery);
            await _context.SaveChangesAsync();

            // Create delivery details
            var deliveryDetails = dto.DeliveryDetails.Select(detail => new DeliveryDetail
            {
                DeliveryId = delivery.Id,
                ProductId = detail.ProductId,
                Quantity = detail.Quantity,
                Note = detail.Note,
                CreatedAt = DateTime.Now
            }).ToList();

            _context.DeliveryDetails.AddRange(deliveryDetails);
            await _context.SaveChangesAsync();

            return delivery;
        }
    }
} 