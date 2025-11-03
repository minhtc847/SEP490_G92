using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ZaloOrderModule.DTO;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using System.Text.RegularExpressions;

namespace SEP490.Modules.ZaloOrderModule.Services
{
    public interface IZaloOrderService
    {
        Task<List<ZaloOrderDTO>> GetAllZaloOrdersAsync();
        Task<ZaloOrderDTO?> GetZaloOrderByIdAsync(int id);
        Task<ZaloOrderDTO> CreateZaloOrderAsync(CreateZaloOrderDTO createDto);
        Task<ZaloOrderDTO?> UpdateZaloOrderAsync(int id, UpdateZaloOrderDTO updateDto);
        Task<bool> DeleteZaloOrderAsync(int id);
        Task<string> ConvertToOrderAsync(int zaloOrderId);
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

        public async Task<string> ConvertToOrderAsync(int zaloOrderId)
        {
            var zaloOrder = await _context.ZaloOrders
                .Include(zo => zo.ZaloOrderDetails)
                .FirstOrDefaultAsync(zo => zo.Id == zaloOrderId);

            if (zaloOrder == null)
                throw new ArgumentException("Zalo order not found");

            if (zaloOrder.Status != ZaloOrderStatus.Pending)
                throw new InvalidOperationException("Only pending orders can be converted");

            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Update Zalo order status to Confirmed
                zaloOrder.Status = ZaloOrderStatus.Confirmed;
                zaloOrder.UpdatedAt = DateTime.Now;

                // 2. Create or find customer
                var customer = await _context.Customers
                    .FirstOrDefaultAsync(c => c.CustomerName == zaloOrder.CustomerName && c.Phone == zaloOrder.CustomerPhone);

                if (customer == null)
                {
                    customer = new Customer
                    {
                        CustomerName = zaloOrder.CustomerName,
                        Address = zaloOrder.CustomerAddress,
                        Phone = zaloOrder.CustomerPhone,
                        Discount = 0
                    };
                    _context.Customers.Add(customer);
                    await _context.SaveChangesAsync();
                }

                // 3. Create products for each order detail if they don't exist
                var products = new List<Product>();
                foreach (var detail in zaloOrder.ZaloOrderDetails)
                {
                    // Check if product already exists by name
                    var existingProduct = await _context.Products
                        .FirstOrDefaultAsync(p => p.ProductName == detail.ProductName);

                    if (existingProduct == null)
                    {
                        // Find GlassStructure by product_code
                        int? glassStructureId = null;
                        if (!string.IsNullOrEmpty(detail.ProductCode))
                        {
                            var glassStructure = await _context.GlassStructures
                                .FirstOrDefaultAsync(gs => gs.ProductCode == detail.ProductCode);
                            glassStructureId = glassStructure?.Id;
                        }

                        // Calculate unit price if GlassStructure has unit price
                        decimal? unitPrice = null;
                        if (glassStructureId.HasValue)
                        {
                            var glassStructure = await _context.GlassStructures.FindAsync(glassStructureId.Value);
                            if (glassStructure?.UnitPrice.HasValue == true && 
                                decimal.TryParse(detail.Width, out var widthMm) && 
                                decimal.TryParse(detail.Height, out var heightMm))
                            {
                                var area = (widthMm * heightMm) / 1_000_000m;
                                unitPrice = area * glassStructure.UnitPrice.Value;
                            }
                        }

                        // Create new product
                        var product = new Product
                        {
                            ProductCode = detail.ProductCode,
                            ProductName = detail.ProductName,
                            ProductType = "Thành phẩm",
                            UOM = "Tấm",
                            Width = detail.Width,
                            Height = detail.Height,
                            Thickness = decimal.TryParse(detail.Thickness, out var thickness) ? thickness : null,
                            UnitPrice = unitPrice,
                            GlassStructureId = glassStructureId,
                            isupdatemisa = 0
                        };

                        _context.Products.Add(product);
                        await _context.SaveChangesAsync();
                        products.Add(product);
                    }
                    else
                    {
                        products.Add(existingProduct);
                    }
                }

                // 4. Generate new order code using GetNextOrderCode method
                var orderCodes = _context.SaleOrders
                    .Where(o => EF.Functions.Like(o.OrderCode, "ĐH%"))
                    .Select(o => o.OrderCode)
                    .ToList();

                int maxNumber = 0;
                foreach (var code in orderCodes)
                {
                    var match = Regex.Match(code, @"ĐH(\d+)");
                    if (match.Success && int.TryParse(match.Groups[1].Value, out int number))
                    {
                        if (number > maxNumber)
                            maxNumber = number;
                    }
                }

                int nextNumber = maxNumber + 1;
                var newOrderCode = $"ĐH{nextNumber:D5}";

                // 5. Create SaleOrder with new order code
                var saleOrder = new SaleOrder
                {
                    CustomerId = customer.Id,
                    OrderCode = newOrderCode,
                    OrderDate = zaloOrder.OrderDate,
                    Status = Status.Pending
                };
                _context.SaleOrders.Add(saleOrder);
                await _context.SaveChangesAsync();

                // 6. Create OrderDetail
                var orderDetail = new OrderDetail { SaleOrderId = saleOrder.Id };
                _context.OrderDetails.Add(orderDetail);
                await _context.SaveChangesAsync();

                // 7. Create OrderDetailProducts
                for (int i = 0; i < zaloOrder.ZaloOrderDetails.Count; i++)
                {
                    var zaloDetail = zaloOrder.ZaloOrderDetails.ElementAt(i);
                    var product = products[i];

                    var orderDetailProduct = new OrderDetailProduct
                    {
                        OrderDetailId = orderDetail.Id,
                        ProductId = product.Id,
                        Quantity = zaloDetail.Quantity,
                        TotalAmount = zaloDetail.TotalPrice
                    };
                    _context.OrderDetailProducts.Add(orderDetailProduct);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return saleOrder.OrderCode;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
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
