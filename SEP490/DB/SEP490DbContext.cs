using Microsoft.EntityFrameworkCore;
using SEP490.DB.Models;

namespace SEP490.DB
{
    public class SEP490DbContext : DbContext
    {
        public SEP490DbContext(DbContextOptions<SEP490DbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Add any additional model configurations here

            modelBuilder.Entity<OrderDetailProduct>()
            .HasKey(x => new { x.OrderDetailId, x.ProductId });
        }

        // Define DbSet properties for your entities here
        public DbSet<TestTable> TestTable { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<GlassStructure> GlassStructures { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<OrderDetailProduct> OrderDetailProducts { get; set; }
        public DbSet<Delivery> Deliveries { get; set; }
        public DbSet<DeliveryDetail> DeliveryDetails { get; set; }
        public DbSet<ProductionPlan> ProductionPlans { get; set; }
        public DbSet<ProductionOrder> ProductionOrders { get; set; }
        public DbSet<WarehouseReceipt> WarehouseReceipts { get; set; }
        public DbSet<WarehouseIssue> WarehouseIssues { get; set; }
        public DbSet<InventoryTransaction> InventoryTransactions { get; set; }

    }
}
