using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ZaloOrderModule.DTO;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public interface IZaloOrderService
    {
        Task<List<ZaloOrderDTO>> GetAllZaloOrdersAsync();
        Task<ZaloOrderDTO?> GetZaloOrderByIdAsync(int id);
        Task<ZaloOrderDTO> CreateZaloOrderAsync(CreateZaloOrderDTO createDto);
        Task<ZaloOrderDTO?> UpdateZaloOrderAsync(int id, UpdateZaloOrderDTO updateDto);
        Task<bool> DeleteZaloOrderAsync(int id);
    }

    public class ZaloOrderService : BaseScopedService, IZaloOrderService
    {
        private readonly SEP490DbContext _context;

        public ZaloOrderService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<List<ZaloOrderDTO>> GetAllZaloOrdersAsync()
        {
            var zaloOrders = await _context.ZaloOrders
                .Include(zo => zo.ZaloOrderDetails)
                .OrderByDescending(zo => zo.CreatedAt)
                .ToListAsync();

            return zaloOrders.Select(MapToDTO).ToList();
        }

        public async Task<ZaloOrderDTO?> GetZaloOrderByIdAsync(int id)
        {
            var zaloOrder = await _context.ZaloOrders
                .Include(zo => zo.ZaloOrderDetails)
                .FirstOrDefaultAsync(zo => zo.Id == id);

            return zaloOrder != null ? MapToDTO(zaloOrder) : null;
        }

        public async Task<ZaloOrderDTO> CreateZaloOrderAsync(CreateZaloOrderDTO createDto)
        {
            var zaloOrder = new ZaloOrder
            {
                OrderCode = createDto.OrderCode,
                ZaloUserId = createDto.ZaloUserId,
                CustomerName = createDto.CustomerName,
                CustomerPhone = createDto.CustomerPhone,
                CustomerAddress = createDto.CustomerAddress,
                OrderDate = createDto.OrderDate,
                TotalAmount = createDto.TotalAmount,
                Status = Enum.Parse<ZaloOrderStatus>(createDto.Status),
                Note = createDto.Note,
                CreatedAt = DateTime.Now
            };

            _context.ZaloOrders.Add(zaloOrder);
            await _context.SaveChangesAsync();

            // Add order details
            foreach (var detailDto in createDto.ZaloOrderDetails)
            {
                var detail = new ZaloOrderDetail
                {
                    ZaloOrderId = zaloOrder.Id,
                    ProductName = detailDto.ProductName,
                    ProductCode = detailDto.ProductCode,
                    Height = detailDto.Height,
                    Width = detailDto.Width,
                    Thickness = detailDto.Thickness,
                    Quantity = detailDto.Quantity,
                    UnitPrice = detailDto.UnitPrice,
                    TotalPrice = detailDto.TotalPrice,
                    CreatedAt = DateTime.Now
                };

                _context.ZaloOrderDetails.Add(detail);
            }

            await _context.SaveChangesAsync();

            return await GetZaloOrderByIdAsync(zaloOrder.Id) ?? throw new InvalidOperationException("Failed to create Zalo order");
        }

        public async Task<ZaloOrderDTO?> UpdateZaloOrderAsync(int id, UpdateZaloOrderDTO updateDto)
        {
            var zaloOrder = await _context.ZaloOrders
                .Include(zo => zo.ZaloOrderDetails)
                .FirstOrDefaultAsync(zo => zo.Id == id);

            if (zaloOrder == null)
                return null;

            // Update main order
            zaloOrder.OrderCode = updateDto.OrderCode;
            zaloOrder.CustomerName = updateDto.CustomerName;
            zaloOrder.CustomerPhone = updateDto.CustomerPhone;
            zaloOrder.CustomerAddress = updateDto.CustomerAddress;
            zaloOrder.OrderDate = updateDto.OrderDate;
            zaloOrder.TotalAmount = updateDto.TotalAmount;
            zaloOrder.Status = Enum.Parse<ZaloOrderStatus>(updateDto.Status);
            zaloOrder.Note = updateDto.Note;
            zaloOrder.UpdatedAt = DateTime.Now;

            // Update order details
            var existingDetailIds = updateDto.ZaloOrderDetails.Select(d => d.Id).ToList();
            var detailsToRemove = zaloOrder.ZaloOrderDetails.Where(d => !existingDetailIds.Contains(d.Id)).ToList();

            foreach (var detail in detailsToRemove)
            {
                _context.ZaloOrderDetails.Remove(detail);
            }

            foreach (var detailDto in updateDto.ZaloOrderDetails)
            {
                var existingDetail = zaloOrder.ZaloOrderDetails.FirstOrDefault(d => d.Id == detailDto.Id);
                if (existingDetail != null)
                {
                    // Update existing detail
                    existingDetail.ProductName = detailDto.ProductName;
                    existingDetail.ProductCode = detailDto.ProductCode;
                    existingDetail.Height = detailDto.Height;
                    existingDetail.Width = detailDto.Width;
                    existingDetail.Thickness = detailDto.Thickness;
                    existingDetail.Quantity = detailDto.Quantity;
                    existingDetail.UnitPrice = detailDto.UnitPrice;
                    existingDetail.TotalPrice = detailDto.TotalPrice;
                }
                else
                {
                    // Add new detail
                    var newDetail = new ZaloOrderDetail
                    {
                        ZaloOrderId = zaloOrder.Id,
                        ProductName = detailDto.ProductName,
                        ProductCode = detailDto.ProductCode,
                        Height = detailDto.Height,
                        Width = detailDto.Width,
                        Thickness = detailDto.Thickness,
                        Quantity = detailDto.Quantity,
                        UnitPrice = detailDto.UnitPrice,
                        TotalPrice = detailDto.TotalPrice,
                        CreatedAt = DateTime.Now
                    };

                    _context.ZaloOrderDetails.Add(newDetail);
                }
            }

            await _context.SaveChangesAsync();

            return await GetZaloOrderByIdAsync(id);
        }

        public async Task<bool> DeleteZaloOrderAsync(int id)
        {
            var zaloOrder = await _context.ZaloOrders
                .Include(zo => zo.ZaloOrderDetails)
                .FirstOrDefaultAsync(zo => zo.Id == id);

            if (zaloOrder == null)
                return false;

            // Remove order details first
            _context.ZaloOrderDetails.RemoveRange(zaloOrder.ZaloOrderDetails);
            
            // Remove the order
            _context.ZaloOrders.Remove(zaloOrder);
            
            await _context.SaveChangesAsync();
            return true;
        }

        private static ZaloOrderDTO MapToDTO(ZaloOrder zaloOrder)
        {
            return new ZaloOrderDTO
            {
                Id = zaloOrder.Id,
                OrderCode = zaloOrder.OrderCode,
                ZaloUserId = zaloOrder.ZaloUserId,
                CustomerName = zaloOrder.CustomerName,
                CustomerPhone = zaloOrder.CustomerPhone,
                CustomerAddress = zaloOrder.CustomerAddress,
                OrderDate = zaloOrder.OrderDate,
                TotalAmount = zaloOrder.TotalAmount,
                Status = zaloOrder.Status.ToString(),
                Note = zaloOrder.Note,
                CreatedAt = zaloOrder.CreatedAt,
                UpdatedAt = zaloOrder.UpdatedAt,
                ZaloOrderDetails = zaloOrder.ZaloOrderDetails.Select(MapDetailToDTO).ToList()
            };
        }

        private static ZaloOrderDetailDTO MapDetailToDTO(ZaloOrderDetail detail)
        {
            return new ZaloOrderDetailDTO
            {
                Id = detail.Id,
                ZaloOrderId = detail.ZaloOrderId,
                ProductName = detail.ProductName,
                ProductCode = detail.ProductCode,
                Height = detail.Height,
                Width = detail.Width,
                Thickness = detail.Thickness,
                Quantity = detail.Quantity,
                UnitPrice = detail.UnitPrice,
                TotalPrice = detail.TotalPrice,
                CreatedAt = detail.CreatedAt
            };
        }
    }
}
