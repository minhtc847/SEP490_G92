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
            modelBuilder.Entity<PurchaseOrder>()
                .HasOne(po => po.Customer)
                .WithMany(c => c.PurchaseOrders)
                .HasForeignKey(po => po.CustomerId); 
        }

        // Define DbSet properties for your entities here
        public DbSet<TestTable> TestTable { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<GlassStructure> GlassStructures { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<SaleOrder> SaleOrders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<OrderDetailProduct> OrderDetailProducts { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<DeliveryHistory> DeliveryHistories { get; set; }
        public DbSet<ProductionPlan> ProductionPlans { get; set; }
        public DbSet<ProductionOrder> ProductionOrders { get; set; }
        public DbSet<ProductionOrderDetail> ProductionOrderDetails { get; set; }
        public DbSet<ProductionPlanDetail> ProductionPlanDetails { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<HistoryMessage> HistoryMessages { get; set; }
        public DbSet<ProductionOutput> ProductionOutputs { get; set; }
        public DbSet<ProductionMaterial> ProductionMaterials { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<PurchaseOrderDetail> PurchaseOrderDetails { get; set; }
        public DbSet<ZaloToken> ZaloTokens { get; set; }
        public DbSet<DeliveryHistoryDetail> DeliveryHistoryDetails { get; set; }
        public DbSet<ChemicalExportDetail> ChemicalExportDetails { get; set; }
        public DbSet<CutGlassInvoiceMaterial> CutGlassInvoiceMaterials { get; set; }
        public DbSet<CutGlassInvoiceOutput> CutGlassInvoiceOutputs { get; set; }
        public DbSet<ExportInvoice> ExportInvoices { get; set; }
        public DbSet<GlueButylExportInvoice> GlueButylExportInvoices { get; set; }
    }
}
