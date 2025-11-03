using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Dashboard.DTO;
using SEP490.Modules.Production_plans.Services;
using SEP490.Modules.ProductionOrders.Services;
using SEP490.Modules.InventorySlipModule.Service;

namespace SEP490.Modules.Dashboard.Services
{
    public class ProductionDashboardService : BaseScopedService, IProductionDashboardService
    {
        private readonly SEP490DbContext _context;
        private readonly IProductionPlanService _productionPlanService;
        private readonly IProductionOrdersService _productionOrdersService;
        private readonly IInventorySlipService _inventorySlipService;

        public ProductionDashboardService(
            SEP490DbContext context,
            IProductionPlanService productionPlanService,
            IProductionOrdersService productionOrdersService,
            IInventorySlipService inventorySlipService)
        {
            _context = context;
            _productionPlanService = productionPlanService;
            _productionOrdersService = productionOrdersService;
            _inventorySlipService = inventorySlipService;
        }

        public async Task<ProductionDashboardOverviewDTO> GetProductionOverviewAsync(string? fromDate = null, string? toDate = null)
        {
            var plans = await GetProductionPlansOverviewAsync(fromDate, toDate).ConfigureAwait(false);
            var orders = await GetProductionOrdersOverviewAsync(fromDate, toDate).ConfigureAwait(false);
            var slips = await GetInventorySlipsOverviewAsync(fromDate, toDate).ConfigureAwait(false);
            var materials = await GetMaterialStatusAsync().ConfigureAwait(false);
            var alerts = await GetProductionAlertsAsync();

            return new ProductionDashboardOverviewDTO
            {
                ProductionPlans = plans,
                ProductionOrders = orders,
                InventorySlips = slips,
                Materials = materials,
                Alerts = alerts
            };
        }

        // Order Details Implementation
        public async Task<List<OrderDetailDTO>> GetOrdersListAsync()
        {
            var orders = await _context.SaleOrders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.OrderDetailProducts)
                .ThenInclude(odp => odp.Product)
                .ToListAsync().ConfigureAwait(false);

            return orders.Select(order => new OrderDetailDTO
            {
                Id = order.Id,
                OrderCode = order.OrderCode ?? "",
                CustomerName = order.Customer?.CustomerName ?? "",
                OrderDate = order.OrderDate,
                TotalValue = order.OrderValue ?? 0,
                Status = order.Status.ToString(),
                Products = order.OrderDetails?.SelectMany(od => od.OrderDetailProducts?.Select(odp => new OrderProductDTO
                {
                    Id = odp.OrderDetailId, // Use OrderDetailId as Id
                    ProductName = odp.Product?.ProductName ?? "",
                    ProductCode = odp.Product?.ProductCode ?? "",
                    Quantity = odp.Quantity ?? 0,
                    DeliveredQuantity = 0, // Will be calculated from production plan details
                    RemainingQuantity = odp.Quantity ?? 0,
                    UnitPrice = 0, // Will be calculated from TotalAmount / Quantity
                    TotalPrice = odp.TotalAmount ?? 0,
                    DeliveryStatus = "Chưa giao"
                }) ?? new List<OrderProductDTO>()).ToList() ?? new List<OrderProductDTO>()
            }).ToList();
        }

        public async Task<OrderDetailDTO> GetOrderDetailsAsync(int orderId)
        {
            var order = await _context.SaleOrders
                .Include(o => o.Customer)
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.OrderDetailProducts)
                .ThenInclude(odp => odp.Product)
                .FirstOrDefaultAsync(o => o.Id == orderId).ConfigureAwait(false);

            if (order == null)
                throw new ArgumentException("Order not found");

            // Get production plan details for delivery status
            var productionPlans = await _context.ProductionPlans
                .Include(p => p.ProductionPlanDetails)
                .Where(p => p.SaleOrderId == orderId)
                .ToListAsync().ConfigureAwait(false);

            var products = new List<OrderProductDTO>();
            
            foreach (var orderDetail in order.OrderDetails ?? new List<OrderDetail>())
            {
                foreach (var orderProduct in orderDetail.OrderDetailProducts ?? new List<OrderDetailProduct>())
                {
                    // Calculate delivered quantity from production plan details
                    var deliveredQuantity = productionPlans
                        .SelectMany(p => p.ProductionPlanDetails ?? new List<ProductionPlanDetail>())
                        .Where(pd => pd.ProductId == orderProduct.ProductId)
                        .Sum(pd => pd.Quantity);

                    var remainingQuantity = (orderProduct.Quantity ?? 0) - deliveredQuantity;
                    var deliveryStatus = remainingQuantity <= 0 ? "Đã giao đủ" : 
                                       deliveredQuantity > 0 ? "Giao một phần" : "Chưa giao";

                    var unitPrice = (orderProduct.Quantity ?? 0) > 0 ? (orderProduct.TotalAmount ?? 0) / (orderProduct.Quantity ?? 1) : 0;
                    
                    products.Add(new OrderProductDTO
                    {
                        Id = orderProduct.OrderDetailId,
                        ProductName = orderProduct.Product?.ProductName ?? "",
                        ProductCode = orderProduct.Product?.ProductCode ?? "",
                        Quantity = orderProduct.Quantity ?? 0,
                        DeliveredQuantity = deliveredQuantity,
                        RemainingQuantity = remainingQuantity,
                        UnitPrice = unitPrice,
                        TotalPrice = orderProduct.TotalAmount ?? 0,
                        DeliveryStatus = deliveryStatus
                    });
                }
            }

            return new OrderDetailDTO
            {
                Id = order.Id,
                OrderCode = order.OrderCode ?? "",
                CustomerName = order.Customer?.CustomerName ?? "",
                OrderDate = order.OrderDate,
                TotalValue = order.OrderValue ?? 0,
                Status = order.Status.ToString(),
                Products = products
            };
        }

        // Helper methods for overview
        private async Task<ProductionPlanOverviewDTO> GetProductionPlansOverviewAsync(string? fromDate = null, string? toDate = null)
        {
            var query = _context.ProductionPlans
                .Include(p => p.SaleOrder)
                .Include(p => p.Customer)
                .AsQueryable();

            if (!string.IsNullOrEmpty(fromDate) && DateTime.TryParse(fromDate, out var from))
            {
                query = query.Where(p => p.PlanDate >= from);
            }

            if (!string.IsNullOrEmpty(toDate) && DateTime.TryParse(toDate, out var to))
            {
                query = query.Where(p => p.PlanDate <= to);
            }

            var plans = await query.ToListAsync().ConfigureAwait(false);

            var totalPlans = plans.Count;
            var activePlans = plans.Count(p => p.Status == "Active");
            var completedPlans = plans.Count(p => p.Status == "Completed");
            var pendingPlans = plans.Count(p => p.Status == "Pending");

            var plansByStatus = plans
                .GroupBy(p => p.Status)
                .Select(g => new PlanStatusSummaryDTO
                {
                    Status = g.Key ?? "",
                    Count = g.Count(),
                    Percentage = totalPlans > 0 ? (g.Count() * 100.0) / totalPlans : 0,
                    Color = GetStatusColor(g.Key ?? "")
                })
                .ToList();

            var recentPlans = plans
                .OrderByDescending(p => p.PlanDate)
                .Take(5)
                .Select(p => new ProductionPlanDTO
                {
                    Id = p.Id,
                    PlanDate = p.PlanDate.ToString("yyyy-MM-dd"),
                    OrderCode = p.SaleOrder?.OrderCode ?? "",
                    OrderId = p.SaleOrder?.Id ?? 0,
                    CustomerName = p.Customer?.CustomerName ?? "",
                    Quantity = 0, // ProductionPlan doesn't have Quantity property
                    Status = p.Status ?? ""
                })
                .ToList();

            return new ProductionPlanOverviewDTO
            {
                TotalPlans = totalPlans,
                ActivePlans = activePlans,
                CompletedPlans = completedPlans,
                PendingPlans = pendingPlans,
                PlansByStatus = plansByStatus,
                RecentPlans = recentPlans
            };
        }

        private async Task<ProductionOrderOverviewDTO> GetProductionOrdersOverviewAsync(string? fromDate = null, string? toDate = null)
        {
            var query = _context.ProductionOrders.AsQueryable();

            if (!string.IsNullOrEmpty(fromDate) && DateTime.TryParse(fromDate, out var from))
            {
                query = query.Where(o => o.OrderDate >= from);
            }

            if (!string.IsNullOrEmpty(toDate) && DateTime.TryParse(toDate, out var to))
            {
                query = query.Where(o => o.OrderDate <= to);
            }

            var orders = await query.ToListAsync().ConfigureAwait(false);
            var totalOrders = orders.Count;
            var activeOrders = orders.Count(o => o.Status == ProductionStatus.InProgress);
            var completedOrders = orders.Count(o => o.Status == ProductionStatus.Completed);
            var pausedOrders = orders.Count(o => o.Status == ProductionStatus.Cancelled);

            var ordersByStatus = orders
                .GroupBy(o => o.Status)
                .Select(g => new OrderStatusSummaryDTO
                {
                    Status = GetOrderStatusName(g.Key ?? ProductionStatus.Pending),
                    Count = g.Count(),
                    Percentage = totalOrders > 0 ? (g.Count() * 100.0) / totalOrders : 0,
                    Color = GetOrderStatusColor(g.Key ?? ProductionStatus.Pending)
                })
                .ToList();

            var ordersByType = orders
                .GroupBy(o => o.Type)
                .Select(g => new OrderTypeSummaryDTO
                {
                    Type = g.Key ?? "",
                    Count = g.Count(),
                    Percentage = totalOrders > 0 ? (g.Count() * 100.0) / totalOrders : 0
                })
                .ToList();

            var efficiency = new ProductionEfficiencyDTO
            {
                AverageCompletionTime = await CalculateAverageProductionTimeAsync(),
                OnTimeDeliveryRate = await CalculateOnTimeDeliveryRateAsync(),
                ResourceUtilization = await CalculateResourceUtilizationAsync()
            };

            return new ProductionOrderOverviewDTO
            {
                TotalOrders = totalOrders,
                ActiveOrders = activeOrders,
                CompletedOrders = completedOrders,
                PausedOrders = pausedOrders,
                OrdersByStatus = ordersByStatus,
                OrdersByType = ordersByType,
                Efficiency = efficiency
            };
        }

        private async Task<InventorySlipOverviewDTO> GetInventorySlipsOverviewAsync(string? fromDate = null, string? toDate = null)
        {
            var query = _context.InventorySlips
                .Include(s => s.ProductionOrder)
                .Include(s => s.CreatedByEmployee)
                .AsQueryable();

            if (!string.IsNullOrEmpty(fromDate) && DateTime.TryParse(fromDate, out var from))
            {
                query = query.Where(s => s.CreatedAt >= from);
            }

            if (!string.IsNullOrEmpty(toDate) && DateTime.TryParse(toDate, out var to))
            {
                query = query.Where(s => s.CreatedAt <= to);
            }

            var slips = await query.ToListAsync().ConfigureAwait(false);

            var totalSlips = slips.Count;
            var finalizedSlips = slips.Count(s => s.IsFinalized);
            var pendingSlips = slips.Count(s => !s.IsFinalized);
            var misaUpdatedSlips = slips.Count(s => s.IsUpdateMisa);

            var recentSlips = slips
                .OrderByDescending(s => s.CreatedAt)
                .Take(5)
                .Select(s => new InventorySlipDTO
                {
                    Id = s.Id,
                    SlipCode = s.SlipCode ?? "",
                    Description = s.Description ?? "",
                    ProductionOrderId = s.ProductionOrderId,
                    ProductionOrderCode = s.ProductionOrder?.ProductionOrderCode ?? "",
                    ProductionOrderType = s.ProductionOrder?.Type ?? "",
                    CreatedByEmployeeName = s.CreatedByEmployee?.FullName ?? "",
                    CreatedAt = s.CreatedAt,
                    IsFinalized = s.IsFinalized,
                    IsUpdateMisa = s.IsUpdateMisa
                })
                .ToList();

            return new InventorySlipOverviewDTO
            {
                TotalSlips = totalSlips,
                FinalizedSlips = finalizedSlips,
                PendingSlips = pendingSlips,
                MisaUpdatedSlips = misaUpdatedSlips,
                SlipsByType = new List<SlipTypeSummaryDTO>(), // Empty list as requested
                RecentSlips = recentSlips
            };
        }

        private async Task<MaterialStatusDTO> GetMaterialStatusAsync()
        {
            var products = await _context.Products.ToListAsync().ConfigureAwait(false);
            var totalMaterials = products.Count;
            var availableMaterials = products.Count(p => p.quantity > 0);
            var lowStockMaterials = products.Count(p => p.quantity > 0 && p.quantity < 10);
            var outOfStockMaterials = products.Count(p => p.quantity <= 0);

            return new MaterialStatusDTO
            {
                TotalMaterials = totalMaterials,
                AvailableMaterials = availableMaterials,
                LowStockMaterials = lowStockMaterials,
                OutOfStockMaterials = outOfStockMaterials,
                MaterialsByStatus = new List<MaterialStatusSummaryDTO>() // Empty list as requested
            };
        }

        private Task<List<ProductionAlertDTO>> GetProductionAlertsAsync()
        {
            // Mock alerts for now
            return Task.FromResult(new List<ProductionAlertDTO>
            {
                new ProductionAlertDTO
                {
                    Id = 1,
                    Type = "warning",
                    Message = "Có 5 sản phẩm sắp hết hàng",
                    CreatedAt = DateTime.Now.AddHours(-2),
                    IsRead = false
                },
                new ProductionAlertDTO
                {
                    Id = 2,
                    Type = "info",
                    Message = "3 lệnh sản xuất đã hoàn thành",
                    CreatedAt = DateTime.Now.AddHours(-1),
                    IsRead = false
                }
            });
        }

        // Helper methods
        private string GetStatusColor(string status)
        {
            return status switch
            {
                "Active" => "blue",
                "Completed" => "green",
                "Pending" => "yellow",
                "Cancelled" => "red",
                "Đang sản xuất" => "purple",
                "Đã hoàn thành" => "orange",
                "Đã hủy" => "red",
                _ => "gray"
            };
        }

        private string GetOrderStatusName(ProductionStatus status)
        {
            return status switch
            {
                ProductionStatus.Pending => "Chờ xử lý",
                ProductionStatus.InProgress => "Đang sản xuất",
                ProductionStatus.Completed => "Đã hoàn thành",
                ProductionStatus.Cancelled => "Đã hủy",
                _ => "Không xác định"
            };
        }

        private string GetOrderStatusColor(ProductionStatus status)
        {
            return status switch
            {
                ProductionStatus.Pending => "yellow",
                ProductionStatus.InProgress => "blue",
                ProductionStatus.Completed => "green",
                ProductionStatus.Cancelled => "red",
                _ => "gray"
            };
        }

        private Task<double> CalculateAverageProductionTimeAsync()
        {
            return Task.FromResult(0.0);
        }

        private Task<double> CalculateOnTimeDeliveryRateAsync()
        {
            return Task.FromResult(0.0);
        }

        private Task<double> CalculateResourceUtilizationAsync()
        {
            return Task.FromResult(0.0);
        }
    }
}