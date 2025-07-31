using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.Modules.Delivery.DTO;

namespace SEP490.Modules.Delivery.Services
{
    public interface IDeliveryService
    {
        Task<List<DeliveryDto>> GetAllDeliveriesAsync();

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
                Status = d.Status,
                Note = d.Note,
                CreatedAt = d.CreatedAt,
                TotalAmount = d.SalesOrder?.OrderValue ?? 0
            }).ToList();
        }
    }
} 