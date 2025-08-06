using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.SaleOrders.DTO;
using System.Text.Json;

namespace SEP490.Modules.SaleOrders.Services
{
    public class ZaloOrderService : BaseService, IZaloOrderService
    {
        private readonly SEP490DbContext _context;

        public ZaloOrderService(SEP490DbContext context)
        {
            _context = context;
        }

        public async Task<ZaloOrderResponseDto> CreateOrderFromZaloAsync(ZaloOrderRequestDto request)
        {
            try
            {
                // 1. Find Customer by phone number
                var customer = await _context.Customers
                    .FirstOrDefaultAsync(c => c.Phone == request.PhoneNumber);

                if (customer == null)
                {
                    return new ZaloOrderResponseDto
                    {
                        Success = false,
                        Message = $"Không tìm thấy khách hàng với số điện thoại: {request.PhoneNumber}"
                    };
                }

                // 2. Generate Order Code
                var orderCode = await GenerateOrderCodeAsync();

                // 3. Create SaleOrder
                var saleOrder = new SaleOrder
                {
                    OrderCode = orderCode,
                    OrderDate = DateTime.UtcNow,
                    CustomerId = customer.Id,
                    Status = Status.Pending,
                    DeliveryStatus = DeliveryStatus.NotDelivered,
                    Note = "Đơn hàng từ Zalo",
                    OrderDetails = new List<OrderDetail>()
                };

                _context.SaleOrders.Add(saleOrder);
                await _context.SaveChangesAsync();

                // 4. Create OrderDetail
                var orderDetail = new OrderDetail
                {
                    OrderCode = orderCode,
                    SaleOrderId = saleOrder.Id,
                    OrderDetailProducts = new List<OrderDetailProduct>()
                };

                _context.OrderDetails.Add(orderDetail);
                await _context.SaveChangesAsync();

                // 5. Process each item and create products if needed
                decimal totalOrderAmount = 0;
                var orderItemDetails = new List<ZaloOrderItemDetailsDto>();

                foreach (var item in request.Items)
                {
                    // Find or create product
                    var product = await FindOrCreateProductAsync(item);
                    if (product == null)
                    {
                        return new ZaloOrderResponseDto
                        {
                            Success = false,
                            Message = $"Không thể tạo sản phẩm với mã: {item.ProductCode}"
                        };
                    }

                    // Calculate item total
                    var unitPrice = product.UnitPrice ?? 0;
                    var itemTotal = unitPrice * item.Quantity;
                    totalOrderAmount += itemTotal;

                    // Create OrderDetailProduct
                    var orderDetailProduct = new OrderDetailProduct
                    {
                        OrderDetailId = orderDetail.Id,
                        ProductId = product.Id,
                        Quantity = item.Quantity,
                        TotalAmount = itemTotal
                    };

                    _context.OrderDetailProducts.Add(orderDetailProduct);

                    // Add to response details
                    orderItemDetails.Add(new ZaloOrderItemDetailsDto
                    {
                        ProductName = product.ProductName ?? "",
                        ProductCode = item.ProductCode,
                        Dimensions = $"{item.Height} x {item.Width} x {item.Thickness}",
                        Quantity = item.Quantity,
                        UnitPrice = unitPrice,
                        TotalPrice = itemTotal
                    });
                }

                // 6. Update totals
                orderDetail.TotalAmount = totalOrderAmount;
                saleOrder.OrderValue = totalOrderAmount;

                await _context.SaveChangesAsync();

                // 7. Return success response
                return new ZaloOrderResponseDto
                {
                    Success = true,
                    Message = "Tạo đơn hàng thành công",
                    OrderDetails = new ZaloOrderDetailsDto
                    {
                        OrderId = saleOrder.Id,
                        OrderCode = orderCode,
                        CustomerName = customer.CustomerName ?? "",
                        CustomerPhone = customer.Phone ?? "",
                        CustomerAddress = customer.Address ?? "",
                        OrderDate = saleOrder.OrderDate,
                        TotalAmount = totalOrderAmount,
                        Items = orderItemDetails
                    }
                };
            }
            catch (Exception ex)
            {
                return new ZaloOrderResponseDto
                {
                    Success = false,
                    Message = $"Lỗi tạo đơn hàng: {ex.Message}"
                };
            }
        }

        public async Task<ZaloOrderDetailsDto?> GetOrderDetailsAsync(int orderId)
        {
            var saleOrder = await _context.SaleOrders
                .Include(so => so.Customer)
                .Include(so => so.OrderDetails)
                    .ThenInclude(od => od.OrderDetailProducts)
                        .ThenInclude(odp => odp.Product)
                .FirstOrDefaultAsync(so => so.Id == orderId);

            if (saleOrder == null) return null;

            var orderDetail = saleOrder.OrderDetails.FirstOrDefault();
            if (orderDetail == null) return null;

            var items = orderDetail.OrderDetailProducts.Select(odp => new ZaloOrderItemDetailsDto
            {
                ProductName = odp.Product.ProductName ?? "",
                ProductCode = odp.Product.ProductCode ?? "",
                Dimensions = $"{odp.Product.Height} x {odp.Product.Width} x {odp.Product.Thickness}",
                Quantity = odp.Quantity ?? 0,
                UnitPrice = odp.Product.UnitPrice ?? 0,
                TotalPrice = odp.TotalAmount ?? 0
            }).ToList();

            return new ZaloOrderDetailsDto
            {
                OrderId = saleOrder.Id,
                OrderCode = saleOrder.OrderCode ?? "",
                CustomerName = saleOrder.Customer.CustomerName ?? "",
                CustomerPhone = saleOrder.Customer.Phone ?? "",
                CustomerAddress = saleOrder.Customer.Address ?? "",
                OrderDate = saleOrder.OrderDate,
                TotalAmount = saleOrder.OrderValue ?? 0,
                Items = items
            };
        }

        private async Task<Product?> FindOrCreateProductAsync(ZaloOrderItemDto item)
        {
            try
            {
                // 1. Find GlassStructure by ProductCode
                var glassStructure = await _context.GlassStructures
                    .FirstOrDefaultAsync(gs => gs.ProductCode == item.ProductCode);

                if (glassStructure == null)
                {
                    Console.WriteLine($"GlassStructure not found for ProductCode: {item.ProductCode}");
                    return null;
                }

                // 2. Try to find existing Product with matching dimensions
                var existingProduct = await _context.Products
                    .FirstOrDefaultAsync(p => 
                        p.GlassStructureId == glassStructure.Id &&
                        p.Height == item.Height &&
                        p.Width == item.Width &&
                        p.Thickness == item.Thickness);

                if (existingProduct != null)
                {
                    return existingProduct;
                }

                // 3. Create new Product if not found
                var newProduct = new Product
                {
                    ProductCode = $"{item.ProductCode}_{item.Height}x{item.Width}x{item.Thickness}",
                    ProductName = $"{glassStructure.ProductName} - {item.Height}x{item.Width}x{item.Thickness}",
                    ProductType = glassStructure.Category,
                    Height = item.Height,
                    Width = item.Width,
                    Thickness = item.Thickness,
                    GlassStructureId = glassStructure.Id,
                    UnitPrice = glassStructure.UnitPrice ?? 0,
                    UOM = "Tấm" // Default UOM for glass products
                };

                _context.Products.Add(newProduct);
                await _context.SaveChangesAsync();

                return newProduct;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in FindOrCreateProductAsync: {ex.Message}");
                return null;
            }
        }

        private async Task<string> GenerateOrderCodeAsync()
        {
            var today = DateTime.Today;
            var datePrefix = today.ToString("yyyyMMdd");
            
            var lastOrder = await _context.SaleOrders
                .Where(so => so.OrderCode!.StartsWith($"ZL{datePrefix}"))
                .OrderByDescending(so => so.OrderCode)
                .FirstOrDefaultAsync();

            int sequence = 1;
            if (lastOrder != null && lastOrder.OrderCode != null)
            {
                var lastSequence = lastOrder.OrderCode.Substring(10); // Skip "ZL" + "yyyyMMdd"
                if (int.TryParse(lastSequence, out int parsed))
                {
                    sequence = parsed + 1;
                }
            }

            return $"ZL{datePrefix}{sequence:D3}"; // ZL20240315001
        }
    }
}