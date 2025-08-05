using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using SEP490.DB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestVNG.Setup
{
    public class TestBase
    {
        protected SEP490DbContext CreateInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<SEP490DbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new SEP490DbContext(options);
        }

        protected IConfiguration CreateMockConfiguration()
        {
            var mockConfig = new Mock<IConfiguration>();
            mockConfig.Setup(x => x["Jwt:Key"]).Returns("your-super-secret-key-with-at-least-32-characters");
            mockConfig.Setup(x => x["Jwt:Issuer"]).Returns("VNG_Glass");
            mockConfig.Setup(x => x["Jwt:Audience"]).Returns("VNG_Glass_Users");
            mockConfig.Setup(x => x["Jwt:ExpiryInMinutes"]).Returns("60");

            return mockConfig.Object;
        }

        protected void SeedTestData(SEP490DbContext context)
        {
            // Thêm dữ liệu test cần thiết
            if (!context.Roles.Any())
            {
                context.Roles.AddRange(TestData.GetRoles());
            }

            if (!context.Employees.Any())
            {
                context.Employees.AddRange(TestData.GetEmployees());
            }

            if (!context.Accounts.Any())
            {
                context.Accounts.AddRange(TestData.GetAccounts());
            }

            if (!context.Customers.Any())
            {
                context.Customers.AddRange(TestData.GetCustomers());
            }

            if (!context.Products.Any())
            {
                context.Products.AddRange(TestData.GetProducts());
            }

            if (!context.SaleOrders.Any())
            {
                context.SaleOrders.AddRange(TestData.GetSaleOrders());
            }

            if (!context.OrderDetails.Any())
            {
                context.OrderDetails.AddRange(TestData.GetOrderDetails());
            }

            if (!context.OrderDetailProducts.Any())
            {
                context.OrderDetailProducts.AddRange(TestData.GetOrderDetailProducts());
            }

            if (!context.ProductionPlans.Any())
            {
                context.ProductionPlans.AddRange(TestData.GetProductionPlans());
            }

            if (!context.ProductionPlanDetails.Any())
            {
                context.ProductionPlanDetails.AddRange(TestData.GetProductionPlanDetails());
            }

            if (!context.Deliveries.Any())
            {
                context.Deliveries.AddRange(TestData.GetDeliveries());
            }

            if (!context.DeliveryDetails.Any())
            {
                context.DeliveryDetails.AddRange(TestData.GetDeliveryDetails());
            }

            if (!context.Invoices.Any())
            {
                context.Invoices.AddRange(TestData.GetInvoices());
            }

            if (!context.InvoiceDetails.Any())
            {
                context.InvoiceDetails.AddRange(TestData.GetInvoiceDetails());
            }

            context.SaveChanges();
        }


    }
}
