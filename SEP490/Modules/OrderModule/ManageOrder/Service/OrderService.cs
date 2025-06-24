using SEP490.DB;
using SEP490.Modules.OrderModule.ManageOrder.DTO;
using SEP490.DB.Models;
using Microsoft.EntityFrameworkCore;

namespace SEP490.Modules.OrderModule.ManageOrder.Services
{
    public class OrderService : IOrderService
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

            if (order == null)
                return null;

            var orderDetails = _context.OrderDetails
                .Where(od => od.SaleOrderId == saleOrderId)
                .ToList();

            var detailProductIds = orderDetails.Select(od => od.Id).ToList();

            var detailProducts = _context.OrderDetailProducts
                .Where(dp => detailProductIds.Contains(dp.OrderDetailId))
                .ToList();

            var products = _context.Products.ToList();

            var productDtos = (from od in orderDetails
                               join dp in detailProducts on od.Id equals dp.OrderDetailId
                               join p in products on dp.ProductId equals p.Id
                               select new ProductInOrderDto
                               {
                                   ProductId = p.Id,
                                   ProductCode = p.ProductCode,
                                   ProductName = p.ProductName,
                                   Height = decimal.TryParse(p.Height, out var height) ? height : 0,
                                   Width = decimal.TryParse(p.Width, out var width) ? width : 0,
                                   Thickness = p.Thickness ?? 0,
                                   AreaM2 = Math.Round(((decimal.TryParse(p.Height, out var h) ? h : 0) * (decimal.TryParse(p.Width, out var w) ? w : 0)) / 1_000_000, 4),
                                   UnitPrice = p.UnitPrice ?? 0,
                                   Quantity = dp.Quantity ?? 0,
                                   TotalAmount = (p.UnitPrice ?? 0) * (dp.Quantity ?? 0)
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


        public bool UpdateOrderDetailById(int orderId, UpdateOrderDetailDto dto)
        {
            var order = _context.SaleOrders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                    .ThenInclude(od => od.OrderDetailProducts)
                .FirstOrDefault(o => o.Id == orderId);

            if (order == null) return false;

            // Cập nhật thông tin khách hàng
            if (order.Customer != null)
            {
                order.Customer.CustomerName = dto.CustomerName;
                order.Customer.Address = dto.Address;
                order.Customer.Phone = dto.Phone;
                order.Customer.Discount = dto.Discount;
            }

            // Cập nhật trạng thái đơn hàng
            order.Status = dto.Status;

            // Lấy OrderDetail đầu tiên (giả sử mỗi đơn hàng chỉ có 1 detail)
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

            foreach (var pDto in dto.Products)
            {
                Product product;


                if (pDto.ProductId == 0)
                {
                    product = new Product
                    {
                        ProductCode = pDto.ProductCode,
                        ProductName = pDto.ProductName,
                        Height = pDto.Height,
                        Width = pDto.Width,
                        Thickness = pDto.Thickness,
                        UnitPrice = pDto.UnitPrice,
                        GlassStructureId = (int)(pDto.GlassStructureId ?? null),
                    };
                    _context.Products.Add(product);
                    _context.SaveChanges();
                }
                else
                {
                    product = _context.Products.FirstOrDefault(p => p.Id == pDto.ProductId);
                    if (product == null) continue;

                    product.ProductCode = pDto.ProductCode;
                    product.ProductName = pDto.ProductName;
                    product.Height = pDto.Height;
                    product.Width = pDto.Width;
                    product.Thickness = pDto.Thickness;
                    product.UnitPrice = pDto.UnitPrice;
                }

                // Tìm xem đã có OrderDetailProduct với product này chưa
                var existingOrderDetailProduct = orderDetail.OrderDetailProducts
                    .FirstOrDefault(odp => odp.ProductId == product.Id);

                if (existingOrderDetailProduct != null)
                {
                    // Nếu có rồi thì cập nhật số lượng
                    existingOrderDetailProduct.Quantity = pDto.Quantity;
                }
                else
                {
                    // Nếu chưa có thì thêm mới
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

        public void UpdateOrder(UpdateOrderDetailDto dto)
        {
            throw new NotImplementedException();
        }
    }
}
