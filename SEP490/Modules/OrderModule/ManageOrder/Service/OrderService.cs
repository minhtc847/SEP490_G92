using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Hubs;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using System.Text.RegularExpressions;

namespace SEP490.Modules.OrderModule.ManageOrder.Services
{
    public class OrderService : BaseScopedService, IOrderService
    {
        private readonly SEP490DbContext _context;
        private readonly IHubContext<SaleOrderHub> _hubContext;
        public OrderService(SEP490DbContext context, IHubContext<SaleOrderHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public List<OrderDto> GetAllOrders()
        {
            var query = _context.SaleOrders
                .Join(_context.Customers,
                    order => order.CustomerId,
                    customer => customer.Id,
                    (order, customer) => new { order, customer })
                .Join(_context.OrderDetails,
                    oc => oc.order.Id,
                    detail => detail.SaleOrderId,
                    (oc, detail) => new { oc.order, oc.customer, detail })
                .Join(_context.OrderDetailProducts,
                    ocd => ocd.detail.Id,
                    odp => odp.OrderDetailId,
                    (ocd, odp) => new { ocd.order, ocd.customer, odp })
                .Join(_context.Products,
                    temp => temp.odp.ProductId,
                    product => product.Id,
                    (temp, product) => new
                    {
                        temp.order.Id,
                        temp.order.OrderCode,
                        temp.order.OrderDate,
                        temp.order.Status,
                        temp.customer.CustomerName,
                        temp.customer.Discount,
                        UnitPrice = product.UnitPrice ?? 0,
                        Quantity = temp.odp.Quantity ?? 0
                    })
                .GroupBy(x => new
                {
                    x.Id,
                    x.OrderCode,
                    x.OrderDate,
                    x.Status,
                    x.CustomerName,
                    x.Discount
                })
                .Select(g => new OrderDto
                {
                    Id = g.Key.Id,
                    CustomerName = g.Key.CustomerName,
                    OrderCode = g.Key.OrderCode,
                    OrderDate = g.Key.OrderDate.Date,
                    Status = g.Key.Status,
                    DeliveryStatus = _context.SaleOrders.First(o => o.Id == g.Key.Id).DeliveryStatus,
                    Discount = g.Key.Discount ?? 0,
                    OriginalTotalAmount = g.Sum(x => x.UnitPrice * x.Quantity),
                    TotalAmount = g.Sum(x => x.UnitPrice * x.Quantity) - (g.Sum(x => x.UnitPrice * x.Quantity) * (g.Key.Discount ?? 0)),
                    isUpdateMisa = _context.SaleOrders.First(o => o.Id == g.Key.Id).IsUpdateMisa
                });

            return query.ToList();
        }

        public OrderDetailDto GetOrderDetailById(int saleOrderId)
        {
            var order = _context.SaleOrders
                .Include(o => o.Customer)
                .FirstOrDefault(o => o.Id == saleOrderId);

            if (order == null) return null;

            var orderDetails = _context.OrderDetails
                .Where(od => od.SaleOrderId == saleOrderId)
                .ToList();

            var detailProductIds = orderDetails.Select(od => od.Id).ToList();

            var detailProducts = _context.OrderDetailProducts
                .Where(dp => detailProductIds.Contains(dp.OrderDetailId))
                .ToList();

            var products = _context.Products.ToList();

            var glassStructures = _context.GlassStructures.ToList();

            var productDtos = (from od in orderDetails
                               join dp in detailProducts on od.Id equals dp.OrderDetailId
                               join p in products on dp.ProductId equals p.Id
                               join g in glassStructures on p.GlassStructureId equals g.Id into gs
                               from g in gs.DefaultIfEmpty()
                               select new ProductInOrderDto
                               {
                                   ProductId = p.Id,
                                   ProductCode = p.ProductCode,
                                   ProductName = p.ProductName,
                                   Height = decimal.TryParse(p.Height, out var height) ? height : 0,
                                   Width = decimal.TryParse(p.Width, out var width) ? width : 0,
                                   Thickness = p.Thickness ?? 0,
                                   AreaM2 = Math.Round(((decimal.TryParse(p.Height, out var h) ? h : 0) * (decimal.TryParse(p.Width, out var w) ? w : 0)) / 1_000_000, 4),
                                   UnitPrice = g != null
                                        ? Math.Round(((decimal.TryParse(p.Height, out var h1) ? h1 : 0) * (decimal.TryParse(p.Width, out var w1) ? w1 : 0)) / 1_000_000 * (g.UnitPrice ?? 0), 2) : 0,
                                   Quantity = dp.Quantity ?? 0,
                                   TotalAmount = g != null
                                        ? Math.Round(((decimal.TryParse(p.Height, out var h2) ? h2 : 0) * (decimal.TryParse(p.Width, out var w2) ? w2 : 0)) / 1_000_000 * (g.UnitPrice ?? 0) * (dp.Quantity ?? 0), 2) : 0,

                                   GlassStructureId = g?.Id,
                                   GlassStructureCode = g?.ProductCode,
                                   GlassCategory = g?.ProductName,
                                   EdgeType = g?.EdgeType,
                                   AdhesiveType = g?.AdhesiveType,
                                   GlassLayers = g?.GlassLayers,
                                   AdhesiveLayers = g?.AdhesiveLayers,
                                   AdhesiveThickness = g?.AdhesiveThickness,
                                   GlassUnitPrice = g?.UnitPrice,
                                   Composition = g?.Composition,
                                   IsUpdateMisa = p.isupdatemisa
                               }).ToList();

            var totalQuantity = productDtos.Sum(p => p.Quantity);
            var totalAmountRaw = detailProducts.Sum(dp => dp.TotalAmount ?? 0);
            var discount = order.Customer?.Discount ?? 1;
            var totalAmount = discount != 0 ? totalAmountRaw / discount : totalAmountRaw;

            // Debug logging
            Console.WriteLine($"Order {order.Id} - IsUpdateMisa: {order.IsUpdateMisa}");

            return new OrderDetailDto
            {
                OrderCode = order.OrderCode,
                OrderDate = order.OrderDate,
                Status = order.Status,
                CustomerName = order.Customer?.CustomerName,
                Address = order.Customer?.Address,
                DeliveryStatus = order.DeliveryStatus,
                Phone = order.Customer?.Phone,
                Discount = discount,
                Products = productDtos,
                TotalQuantity = totalQuantity,
                TotalAmount = Math.Round(totalAmount, 2),
                isUpdateMisa = order.IsUpdateMisa
            };
        }
        public async Task<Product> CreateProductAsync(CreateProductV2Dto dto)
        {
            bool isNameExisted = await _context.Products.AnyAsync(p => p.ProductName == dto.ProductName);
         

            if (!decimal.TryParse(dto.Width, out var widthMm) || !decimal.TryParse(dto.Height, out var heightMm))
                throw new Exception("Chiều rộng hoặc chiều cao không hợp lệ.");

            var area = (widthMm * heightMm) / 1_000_000m;

            var structure = await _context.GlassStructures.FirstOrDefaultAsync(x => x.Id == dto.GlassStructureId);
            
            decimal? calculatedUnitPrice;
            if (structure != null && structure.UnitPrice.HasValue)
            {
                // Có cấu trúc kính - tính giá theo cấu trúc
                calculatedUnitPrice = area * structure.UnitPrice.Value;
            }
            else
            {
                // Không có cấu trúc kính - unitPrice = null
                calculatedUnitPrice = null;
            }

            var product = new Product
            {
                ProductCode = null,
                ProductName = dto.ProductName,
                ProductType = dto.ProductType ?? "Thành phẩm",
                UOM = dto.UOM ?? "Tấm",
                Width = dto.Width,
                Height = dto.Height,
                Thickness = dto.Thickness,
                Weight = dto.Weight,
                UnitPrice = calculatedUnitPrice,
                GlassStructureId = dto.GlassStructureId,
                isupdatemisa = dto.Isupdatemisa
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<int> CreateOrderAsync(CreateOrderDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.CustomerName))
                throw new ArgumentException("CustomerName is required");
            if (string.IsNullOrWhiteSpace(dto.Phone))
                throw new ArgumentException("Phone is required");
            if (dto.Products == null || !dto.Products.Any())
                throw new ArgumentException("Order must have at least one product");

            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => c.CustomerName == dto.CustomerName && c.Phone == dto.Phone);

            if (customer == null)
            {
                customer = new Customer
                {
                    CustomerName = dto.CustomerName,
                    Address = dto.Address,
                    Phone = dto.Phone,
                    Discount = dto.Discount
                };
                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();
            }

            var order = new SaleOrder
            {
                CustomerId = customer.Id,
                OrderCode = dto.OrderCode,
                OrderDate = dto.OrderDate,
                Status = Enum.Parse<Status>(dto.Status)
            };
            _context.SaleOrders.Add(order);
            await _context.SaveChangesAsync();

            var detail = new OrderDetail { SaleOrderId = order.Id };
            _context.OrderDetails.Add(detail);
            await _context.SaveChangesAsync();

            decimal orderValue = 0m;

            foreach (var p in dto.Products)
            {
                var product = await _context.Products.FindAsync(p.ProductId);
                if (product == null)
                    throw new InvalidOperationException($"Product with ID {p.ProductId} not found");

                var odp = new OrderDetailProduct
                {
                    OrderDetailId = detail.Id,
                    ProductId = p.ProductId,
                    Quantity = p.Quantity,
                    TotalAmount = p.Quantity * p.UnitPrice
                };
                _context.OrderDetailProducts.Add(odp);

                orderValue += (p.Quantity * p.UnitPrice);
            }

            order.OrderValue = orderValue;
            await _context.SaveChangesAsync();
            return order.Id;
        }

        public bool UpdateOrderDetailById(int orderId, UpdateOrderDetailDto dto)
        {
            var order = _context.SaleOrders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.OrderDetailProducts)
                .FirstOrDefault(o => o.Id == orderId);

            if (order == null) return false;

            if (order.Customer != null)
            {
                order.Customer.CustomerName = dto.CustomerName;
                order.Customer.Address = dto.Address;
                order.Customer.Phone = dto.Phone;
                order.Customer.Discount = dto.Discount;
            }

            if (!string.IsNullOrWhiteSpace(dto.Status) && Enum.TryParse<Status>(dto.Status, ignoreCase: true, out var parsedStatus))
            {
                order.Status = parsedStatus;
            }

            if (!string.IsNullOrWhiteSpace(dto.DeliveryStatus) && Enum.TryParse<DeliveryStatus>(dto.DeliveryStatus, ignoreCase: true, out var parsedDeliveryStatus))
            {
                order.DeliveryStatus = parsedDeliveryStatus;
            }

            _context.SaveChanges();
            return true;
        }

        public bool UpdateOrderMisaStatus(int orderId)
        {
            var order = _context.SaleOrders.FirstOrDefault(o => o.Id == orderId);
            if (order == null) return false;

            order.IsUpdateMisa = true;
            _context.SaveChanges();
            return true;
        }

        public object GetOrderDataForMisa(int orderId)
        {
            var order = _context.SaleOrders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.OrderDetailProducts)
                        .ThenInclude(odp => odp.Product)
                .FirstOrDefault(o => o.Id == orderId);

            if (order == null) return null;

            var productsInput = order.OrderDetails
                .SelectMany(od => od.OrderDetailProducts)
                .Select(odp => new
                {
                    ProductCode = odp.Product?.ProductName ?? "",
                    ProductQuantity = odp.Quantity?.ToString() ?? "0",
                    Price = odp.Product?.UnitPrice?.ToString() ?? "0"
                })
                .ToList();

            return new
            {
                CustomerCode = order.Customer?.CustomerCode ?? "",
                ProductsInput = productsInput
            };
        }

        public void DeleteOrder(int orderId)
        {
            var order = _context.SaleOrders.FirstOrDefault(o => o.Id == orderId);
            if (order == null) throw new Exception("Order not found");

            var orderDetails = _context.OrderDetails
                .Where(od => od.SaleOrderId == orderId)
                .ToList();

            var orderDetailIds = orderDetails.Select(od => od.Id).ToList();

            var orderDetailProducts = _context.OrderDetailProducts
                .Where(dp => orderDetailIds.Contains(dp.OrderDetailId))
                .ToList();

            _context.OrderDetailProducts.RemoveRange(orderDetailProducts);
            _context.OrderDetails.RemoveRange(orderDetails);
            _context.SaleOrders.Remove(order);

            _context.SaveChanges();
        }

        public List<CustomerSearchResultDto> SearchCustomers(string keyword)
        {
            return _context.Customers
                .Where(c => !c.IsSupplier && (
                    c.CustomerCode.Contains(keyword) ||
                    c.CustomerName.Contains(keyword)
                ))
                .Select(c => new CustomerSearchResultDto
                {
                    Id = c.Id,
                    CustomerCode = c.CustomerCode,
                    CustomerName = c.CustomerName,
                    Address = c.Address,
                    Phone = c.Phone,
                    Discount = c.Discount
                })
                .Take(20)
                .ToList();
        }

        public string GetNextOrderCode()
        {
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
            return $"ĐH{nextNumber:D5}";
        }
        public List<GlassStructureDto> GetAllGlassStructures()
        {
            return _context.GlassStructures
                .Select(g => new GlassStructureDto
                {
                    Id = g.Id,
                    ProductCode = g.ProductCode,
                    ProductName = g.ProductName,
                    UnitPrice = g.UnitPrice
                })
                .ToList();
        }

        public bool UpdateOrderStatus(int orderId, int status)
        {
            var order = _context.SaleOrders.FirstOrDefault(o => o.Id == orderId);
            if (order == null) return false;

            // Convert int to Status enum
            if (Enum.IsDefined(typeof(Status), status))
            {
                order.Status = (Status)status;
                _context.SaveChanges();
                return true;
            }
            
            return false; // Invalid status value
        }

        public object CheckOrderProductsMisaStatus(int orderId)
        {
            var order = _context.SaleOrders
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.OrderDetailProducts)
                        .ThenInclude(odp => odp.Product)
                .FirstOrDefault(o => o.Id == orderId);

            if (order == null) 
                return new { success = false, message = "Không tìm thấy đơn hàng" };

            var products = order.OrderDetails
                .SelectMany(od => od.OrderDetailProducts)
                .Select(odp => new
                {
                    ProductId = odp.ProductId,
                    ProductCode = odp.Product?.ProductCode ?? "",
                    ProductName = odp.Product?.ProductName ?? "",
                    Quantity = odp.Quantity ?? 0,
                    IsUpdateMisa = odp.Product?.isupdatemisa ?? false
                })
                .ToList();

            var totalProducts = products.Count;
            var updatedProducts = products.Count(p => p.IsUpdateMisa);
            var notUpdatedProducts = products.Where(p => !p.IsUpdateMisa).ToList();

            var canUpdateMisa = totalProducts > 0 && updatedProducts == totalProducts;

            return new
            {
                success = true,
                canUpdateMisa = canUpdateMisa,
                totalProducts = totalProducts,
                updatedProducts = updatedProducts,
                notUpdatedProducts = notUpdatedProducts,
                message = canUpdateMisa 
                    ? "Tất cả sản phẩm đã được cập nhật MISA. Có thể tiến hành cập nhật đơn hàng."
                    : $"Có {notUpdatedProducts.Count} sản phẩm chưa được cập nhật MISA. Vui lòng cập nhật MISA cho tất cả sản phẩm trước."
            };
        }

    }
}