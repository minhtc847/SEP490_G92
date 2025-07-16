using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Delivery.DTO;
using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;

namespace SEP490.Modules.Delivery.Services
{
    public class DeliveryHistoryService : BaseService, IDeliveryHistoryService
    {
        private readonly SEP490DbContext _context;
        public DeliveryHistoryService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<List<DeliveryOrderDto>> GetDeliveryOrdersByProductionPlanIdAsync(int productionPlanId)
        {
            var query = _context.ProductionPlans
                .Include(p => p.SaleOrder)
                    .ThenInclude(so => so.Customer)
                .Include(p => p.ProductionPlanDetails)
                    .ThenInclude(ppd => ppd.Product)
                .AsQueryable();

            if (productionPlanId != 0)
            {
                query = query.Where(p => p.Id == productionPlanId);
            }

            var plans = await query.ToListAsync();
            var result = new List<DeliveryOrderDto>();

            foreach (var plan in plans)
            {
                var saleOrder = plan.SaleOrder;
                var customerName = saleOrder?.Customer?.CustomerName ?? plan.Customer?.CustomerName ?? "";
                var orderDate = saleOrder?.OrderDate.ToString("yyyy-MM-dd") ?? plan.PlanDate.ToString("yyyy-MM-dd");
                var note = saleOrder?.Note;

                var products = new List<DeliveryProductDto>();
                foreach (var detail in plan.ProductionPlanDetails)
                {
                    var product = detail.Product;
                    var deliveryHistories = await _context.DeliveryHistories
                        .Where(dh => dh.ProductionPlanDetailId == detail.Id)
                        .ToListAsync();
                    var delivered = deliveryHistories.Sum(dh => dh.QuantityDelivered);
                    var lastDeliveryDate = deliveryHistories.OrderByDescending(dh => dh.DeliveryDate).FirstOrDefault()?.DeliveryDate.ToString("yyyy-MM-dd") ?? "";
                    decimal totalAmount = 0;
                    if (product != null && product.UnitPrice.HasValue)
                    {
                        totalAmount = detail.Quantity * product.UnitPrice.Value;
                    }
                    products.Add(new DeliveryProductDto
                    {
                        Id = detail.Id,
                        ProductName = product?.ProductName ?? "",
                        Quantity = detail.Quantity,
                        Done = detail.Done, // số lượng đã xong
                        TotalAmount = totalAmount,
                        Delivered = delivered,
                        LastDeliveryDate = lastDeliveryDate,
                        Note = null
                    });
                }

                result.Add(new DeliveryOrderDto
                {
                    Id = plan.Id,
                    OrderDate = orderDate,
                    CustomerName = customerName,
                    Note = note,
                    Products = products
                });
            }
            return result;
        }

        public async Task<List<DeliveryHistoryDto>> GetDeliveryHistoryByProductAsync(int productionPlanDetailId)
        {
            var histories = await _context.DeliveryHistories
                .Where(dh => dh.ProductionPlanDetailId == productionPlanDetailId)
                .OrderBy(dh => dh.DeliveryDate)
                .ToListAsync();
            return histories.Select(dh => new DeliveryHistoryDto
            {
                Id = dh.Id,
                DeliveryDate = dh.DeliveryDate.ToString("yyyy-MM-dd"),
                Quantity = dh.QuantityDelivered,
                Note = dh.Note
            }).ToList();
        }

        public async Task<DeliveryHistoryDto> CreateDeliveryHistoryAsync(int productionPlanDetailId, CreateDeliveryHistoryDto dto)
        {
            var entity = new DeliveryHistory
            {
                ProductionPlanDetailId = productionPlanDetailId,
                DeliveryDate = DateTime.Parse(dto.DeliveryDate),
                QuantityDelivered = dto.Quantity,
                Note = dto.Note
            };
            _context.DeliveryHistories.Add(entity);
            await _context.SaveChangesAsync();
            return new DeliveryHistoryDto
            {
                Id = entity.Id,
                DeliveryDate = entity.DeliveryDate.ToString("yyyy-MM-dd"),
                Quantity = entity.QuantityDelivered,
                Note = entity.Note
            };
        }
    }
} 