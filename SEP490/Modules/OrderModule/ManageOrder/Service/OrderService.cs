using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using System.Text.RegularExpressions;

namespace SEP490.Modules.OrderModule.ManageOrder.Services
{
    public class OrderService : BaseService, IOrderService
    {
        private readonly SEP490DbContext _context;

        public OrderService(SEP490DbContext context)
        {
            _context = context;
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
                    Discount = g.Key.Discount ?? 0,
                    OriginalTotalAmount = g.Sum(x => x.UnitPrice * x.Quantity),
                    TotalAmount = g.Sum(x => x.UnitPrice * x.Quantity) - (g.Sum(x => x.UnitPrice * x.Quantity) * (g.Key.Discount ?? 0))
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
                                        ? Math.Round(((decimal.TryParse(p.Height, out var h1) ? h1 : 0) * (decimal.TryParse(p.Width, out var w1) ? w1 : 0)) / 1_000_000 * (g.UnitPrice ?? 0), 2): 0,
                                   Quantity = dp.Quantity ?? 0,
                                   TotalAmount = g != null
                                        ? Math.Round(((decimal.TryParse(p.Height, out var h2) ? h2 : 0) * (decimal.TryParse(p.Width, out var w2) ? w2 : 0)) / 1_000_000 * (g.UnitPrice ?? 0) * (dp.Quantity ?? 0), 2): 0,

                                   GlassStructureId = g?.Id,
                                   GlassStructureCode = g?.ProductCode,
                                   GlassCategory = g?.ProductName,
                                   EdgeType = g?.EdgeType,
                                   AdhesiveType = g?.AdhesiveType,
                                   GlassLayers = g?.GlassLayers,
                                   AdhesiveLayers = g?.AdhesiveLayers,
                                   AdhesiveThickness = g?.AdhesiveThickness,
                                   GlassUnitPrice = g?.UnitPrice,
                                   Composition = g?.Composition
                               }).ToList();

            var totalQuantity = productDtos.Sum(p => p.Quantity);
            var totalAmountRaw = detailProducts.Sum(dp => dp.TotalAmount ?? 0);
            var discount = order.Customer?.Discount ?? 1;
            var totalAmount = discount != 0 ? totalAmountRaw / discount : totalAmountRaw;

            return new OrderDetailDto
            {
                OrderCode = order.OrderCode,
                OrderDate = order.OrderDate,
                Status = order.Status,
                CustomerName = order.Customer?.CustomerName,
                Address = order.Customer?.Address,
                Phone = order.Customer?.Phone,
                Discount = discount,
                Products = productDtos,
                TotalQuantity = totalQuantity,
                TotalAmount = Math.Round(totalAmount, 2)
            };
        }
        public async Task<Product> CreateProductAsync(CreateProductV2Dto dto)
        {
            bool isNameExisted = await _context.Products.AnyAsync(p => p.ProductName == dto.ProductName);
            if (isNameExisted)
                throw new Exception("Tên sản phẩm đã tồn tại!");

            if (!decimal.TryParse(dto.Width, out var widthMm) || !decimal.TryParse(dto.Height, out var heightMm))
                throw new Exception("Chiều rộng hoặc chiều cao không hợp lệ.");

            var area = (widthMm * heightMm) / 1_000_000m;

            var structure = await _context.GlassStructures.FirstOrDefaultAsync(x => x.Id == dto.GlassStructureId);
            if (structure == null || structure.UnitPrice == null)
                throw new Exception("Cấu trúc kính không tồn tại hoặc chưa có đơn giá.");

            var calculatedUnitPrice = area * structure.UnitPrice.Value;

            var product = new Product
            {
                ProductCode = null,
                ProductName = dto.ProductName,
                ProductType = dto.ProductType ?? "Thành Phẩm",
                UOM = dto.UOM ?? "Tấm",
                Width = dto.Width,
                Height = dto.Height,
                Thickness = dto.Thickness,
                Weight = dto.Weight,
                UnitPrice = calculatedUnitPrice,
                GlassStructureId = dto.GlassStructureId,
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return product;
        }

        public async Task<int> CreateOrderAsync(CreateOrderDto dto)
        {
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
                Status = dto.Status
            };
            _context.SaleOrders.Add(order);
            await _context.SaveChangesAsync();

            var detail = new OrderDetail
            {
                SaleOrderId = order.Id
            };
            _context.OrderDetails.Add(detail);
            await _context.SaveChangesAsync();

            foreach (var p in dto.Products)
            {
                var odp = new OrderDetailProduct
                {
                    OrderDetailId = detail.Id,
                    ProductId = p.ProductId,
                    Quantity = p.Quantity,
                    TotalAmount = p.Quantity * p.UnitPrice
                };
                _context.OrderDetailProducts.Add(odp);
            }

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

            order.Status = dto.Status;

            var orderDetail = order.OrderDetails.FirstOrDefault();
            if (orderDetail == null)
            {
                orderDetail = new OrderDetail
                {
                    SaleOrderId = order.Id,
                    OrderDetailProducts = new List<OrderDetailProduct>()
                };
                order.OrderDetails.Add(orderDetail);
            }

            var updatedProductIds = dto.Products
                .Where(p => p.ProductId != 0)
                .Select(p => p.ProductId)
                .ToList();

            var productsToRemove = orderDetail.OrderDetailProducts
                .Where(odp => !updatedProductIds.Contains(odp.ProductId))
                .ToList();

            foreach (var odp in productsToRemove)
            {
                _context.OrderDetailProducts.Remove(odp);
            }
            foreach (var pDto in dto.Products)
            {
                Product product;


                    product = _context.Products.FirstOrDefault(p => p.Id == pDto.ProductId);
                    if (product == null) continue;

                    product.ProductCode = pDto.ProductCode;
                    product.ProductName = pDto.ProductName;
                    product.Height = pDto.Height;
                    product.Width = pDto.Width;
                    product.Thickness = pDto.Thickness;
                    product.UnitPrice = pDto.UnitPrice;

                var existingOrderDetailProduct = orderDetail.OrderDetailProducts
                    .FirstOrDefault(odp => odp.ProductId == product.Id);

                if (existingOrderDetailProduct != null)
                {
                    existingOrderDetailProduct.Quantity = pDto.Quantity;
                }
                else
                {
                    orderDetail.OrderDetailProducts.Add(new OrderDetailProduct
                    {
                        ProductId = product.Id,
                        Quantity = pDto.Quantity
                    });
                }
            }

            _context.SaveChanges();
            return true;
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



    }
}
