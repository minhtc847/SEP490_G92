using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using SEP490.DB.Models;
using SEP490.Modules.GlueButylExport.DTO;
using System.Text.Json;

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
            var productConverter = new ValueConverter<List<ProductsDTO>, string>(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<ProductsDTO>>(v, (JsonSerializerOptions)null)
            );

            modelBuilder.Entity<GlueButylExportInvoice>()
                .Property(e => e.Products)
                .HasConversion(productConverter);

            modelBuilder.Entity<ZaloOrderDetail>()
                .HasOne(zod => zod.ZaloOrder)
                .WithMany(zo => zo.ZaloOrderDetails)
                .HasForeignKey(zod => zod.ZaloOrderId);

            // Zalo Conversation State relationships
            modelBuilder.Entity<ZaloConversationState>()
                .HasOne(cs => cs.Customer)
                .WithMany()
                .HasForeignKey(cs => cs.CustomerId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ZaloConversationMessage>()
                .HasOne(cm => cm.ZaloConversationState)
                .WithMany(cs => cs.MessageHistory)
                .HasForeignKey(cm => cm.ZaloConversationStateId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ZaloConversationOrderItem>()
                .HasOne(oi => oi.ZaloConversationState)
                .WithMany(cs => cs.OrderItems)
                .HasForeignKey(oi => oi.ZaloConversationStateId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InventorySlip>()
                .HasOne(s => s.ProductionOrder)
                .WithMany()
                .HasForeignKey(s => s.ProductionOrderId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<InventorySlip>()
                .HasOne(s => s.CreatedByEmployee)
                .WithMany()
                .HasForeignKey(s => s.CreatedBy)
                .OnDelete(DeleteBehavior.Restrict);
            
            modelBuilder.Entity<InventorySlipDetail>()
                .HasOne(d => d.InventorySlip)
                .WithMany(s => s.Details)
                .HasForeignKey(d => d.InventorySlipId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<InventorySlipDetail>()
                .HasOne(d => d.Product)
                .WithMany()
                .HasForeignKey(d => d.ProductId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<InventorySlipDetail>()
                .HasOne(d => d.ProductionOutput)
                .WithMany()
                .HasForeignKey(d => d.ProductionOutputId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<MaterialOutputMapping>()
                .HasOne(m => m.InputDetail)
                .WithMany(d => d.InputMappings)
                .HasForeignKey(m => m.InputDetailId)
                .OnDelete(DeleteBehavior.Cascade);
                
            modelBuilder.Entity<MaterialOutputMapping>()
                .HasOne(m => m.OutputDetail)
                .WithMany(d => d.OutputMappings)
                .HasForeignKey(m => m.OutputDetailId)
                .OnDelete(DeleteBehavior.Cascade);

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
        public DbSet<ProductionOutput> ProductionOutputs { get; set; }
        public DbSet<ProductionMaterial> ProductionMaterials { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<PurchaseOrderDetail> PurchaseOrderDetails { get; set; }
        public DbSet<ZaloToken> ZaloTokens { get; set; }
        public DbSet<ChemicalExportDetail> ChemicalExportDetails { get; set; }
        public DbSet<ChemicalExport> ChemicalExports { get; set; }
        public DbSet<CutGlassInvoiceMaterial> CutGlassInvoiceMaterials { get; set; }
        public DbSet<CutGlassInvoiceOutput> CutGlassInvoiceOutputs { get; set; }
        public DbSet<GlueButylExportInvoice> GlueButylExportInvoices { get; set; }
        public DbSet<Formular> Formulars { get; set; }
        public DbSet<Debts> Debts { get; set; }
        public DbSet<Delivery> Deliveries { get; set; }
        public DbSet<DeliveryDetail> DeliveryDetails { get; set; }
        public DbSet<FinishedGoods> FinishedGoods { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceDetails> InvoiceDetails { get; set; }
        public DbSet<Payments> Payments { get; set; }
        public DbSet<ProductionDefects> ProductionDefects { get; set; }
        public DbSet<ZaloOrder> ZaloOrders { get; set; }
        public DbSet<ZaloOrderDetail> ZaloOrderDetails { get; set; }
        public DbSet<ZaloConversationState> ZaloConversationStates { get; set; }
        public DbSet<ZaloConversationMessage> ZaloConversationMessages { get; set; }
        public DbSet<ZaloConversationOrderItem> ZaloConversationOrderItems { get; set; }
        public DbSet<InventorySlip> InventorySlips { get; set; }
        public DbSet<InventorySlipDetail> InventorySlipDetails { get; set; }
        public DbSet<MaterialOutputMapping> MaterialOutputMappings { get; set; }
    }
}
