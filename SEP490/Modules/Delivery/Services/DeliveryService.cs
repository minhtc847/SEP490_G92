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
        Task<bool> UpdateDeliveryStatusAsync(int deliveryId, int newStatus);
        Task<DeliveryDetailDto> GetDeliveryDetailAsync(int deliveryId);
        Task<bool> UpdateDeliveryAsync(int deliveryId, UpdateDeliveryDto dto);
    }

    public class DeliveryService : BaseScopedService, IDeliveryService
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

            // Update the DaGiao field in ProductionPlanDetail for each delivered product
            // foreach (var detail in dto.DeliveryDetails)
            // {
            //     var planDetail = productionPlan.ProductionPlanDetails
            //         .FirstOrDefault(pd => pd.ProductId == detail.ProductId);
                
            //     if (planDetail != null)
            //     {
            //         planDetail.DaGiao += detail.Quantity;
            //     }
            // }

            await _context.SaveChangesAsync();

            return delivery;
        }

        public async Task<bool> UpdateDeliveryStatusAsync(int deliveryId, int newStatus)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.SalesOrder)
                .FirstOrDefaultAsync(d => d.Id == deliveryId);

            if (delivery == null)
            {
                throw new InvalidOperationException("Không tìm thấy phiếu giao hàng");
            }

            // Update delivery status
            delivery.Status = (DeliveryStatus)newStatus;

            // If status is "Hoàn thành" (2), update DaGiao field in ProductionPlanDetail and check sales order delivery status
            if (newStatus == 2)
            {
                var productionPlan = await _context.ProductionPlans
                    .Include(p => p.ProductionPlanDetails)
                    .FirstOrDefaultAsync(p => p.SaleOrderId == delivery.SalesOrderId);

                if (productionPlan != null)
                {
                    // Get all delivery details for this delivery
                    var deliveryDetails = await _context.DeliveryDetails
                        .Where(dd => dd.DeliveryId == deliveryId)
                        .ToListAsync();

                    // Update DaGiao field for each product
                    foreach (var detail in deliveryDetails)
                    {
                        var planDetail = productionPlan.ProductionPlanDetails
                            .FirstOrDefault(pd => pd.ProductId == detail.ProductId);
                        
                        if (planDetail != null)
                        {
                            planDetail.DaGiao += detail.Quantity;
                        }
                    }

                    // Check if all products in the production plan are fully delivered
                    bool allProductsDelivered = productionPlan.ProductionPlanDetails.All(pd => pd.DaGiao >= pd.Quantity);

                    // Update sales order delivery status
                    if (delivery.SalesOrder != null)
                    {
                        if (allProductsDelivered)
                        {
                            // All products are delivered, set sales order to fully delivered
                            delivery.SalesOrder.DeliveryStatus = DeliveryStatus.FullyDelivered;
                        }
                        else
                        {
                            // Some products are still being delivered, set sales order to delivering
                            delivery.SalesOrder.DeliveryStatus = DeliveryStatus.Delivering;
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<DeliveryDetailDto> GetDeliveryDetailAsync(int deliveryId)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.SalesOrder)
                .ThenInclude(so => so.Customer)
                .Include(d => d.DeliveryDetails)
                .ThenInclude(dd => dd.Product)
                .FirstOrDefaultAsync(d => d.Id == deliveryId);

            if (delivery == null)
            {
                throw new InvalidOperationException("Không tìm thấy phiếu giao hàng");
            }

            var deliveryDetails = delivery.DeliveryDetails.Select(dd => new DeliveryDetailItemDto
            {
                Id = dd.DeliveryDetailId,
                ProductId = dd.ProductId,
                ProductName = dd.Product?.ProductName ?? $"Sản phẩm {dd.ProductId}",
                Quantity = dd.Quantity,
                UnitPrice = 0, // Will be calculated from sales order
                Amount = 0, // Will be calculated
                Note = dd.Note
            }).ToList();

            // Calculate unit prices and amounts from sales order
            if (delivery.SalesOrder != null)
            {
                var orderDetailProducts = await _context.OrderDetailProducts
                    .Where(odp => odp.OrderDetail.SaleOrderId == delivery.SalesOrderId)
                    .Include(odp => odp.Product)
                    .Include(odp => odp.OrderDetail)
                    .ToListAsync();

                foreach (var detail in deliveryDetails)
                {
                    var orderDetailProduct = orderDetailProducts.FirstOrDefault(odp => odp.ProductId == detail.ProductId);
                    if (orderDetailProduct != null)
                    {
                        detail.UnitPrice = orderDetailProduct.TotalAmount ?? 0;
                        detail.Amount = detail.Quantity * detail.UnitPrice;
                    }
                }
            }

            var customerId = delivery.SalesOrder?.Customer?.Id ?? 0;

            return new DeliveryDetailDto
            {
                Id = delivery.Id,
                SalesOrderId = delivery.SalesOrderId,
                CustomerId = customerId,
                OrderCode = delivery.SalesOrder?.OrderCode ?? "",
                CustomerName = delivery.SalesOrder?.Customer?.CustomerName ?? "",
                CustomerAddress = delivery.SalesOrder?.Customer?.Address ?? "",
                CustomerPhone = delivery.SalesOrder?.Customer?.Phone ?? "",
                DeliveryDate = delivery.DeliveryDate,
                ExportDate = delivery.ExportDate,
                Status = delivery.Status,
                Note = delivery.Note,
                CreatedAt = delivery.CreatedAt,
                TotalAmount = deliveryDetails.Sum(d => d.Amount),
                DeliveryDetails = deliveryDetails
            };
        }

        public async Task<bool> UpdateDeliveryAsync(int deliveryId, UpdateDeliveryDto dto)
        {
            var delivery = await _context.Deliveries
                .Include(d => d.DeliveryDetails)
                .FirstOrDefaultAsync(d => d.Id == deliveryId);

            if (delivery == null)
            {
                throw new InvalidOperationException("Không tìm thấy phiếu giao hàng");
            }

            // Update delivery basic info
            delivery.DeliveryDate = dto.DeliveryDate;
            delivery.ExportDate = dto.ExportDate;
            delivery.Status = dto.Status;
            delivery.Note = dto.Note;

            // Update delivery details
            foreach (var detailDto in dto.DeliveryDetails)
            {
                var existingDetail = delivery.DeliveryDetails.FirstOrDefault(dd => dd.DeliveryDetailId == detailDto.Id);
                if (existingDetail != null)
                {
                    existingDetail.Quantity = detailDto.Quantity;
                    existingDetail.Note = detailDto.Note;
                }
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
} 