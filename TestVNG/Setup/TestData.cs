using SEP490.DB.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestVNG.Setup
{
    internal class TestData
    {

        public static List<Role> GetRoles()
        {
            return new List<Role>
            {
                new Role { Id = 1, RoleName = "Admin"},
                new Role { Id = 2, RoleName = "User"},
                new Role { Id = 3, RoleName = "Manager" }
            };
        }

        public static List<Employee> GetEmployees()
        {
            return new List<Employee>
            {
                new Employee { Id = 1, FullName = "John Doe", Email = "john@example.com" },
                new Employee { Id = 2, FullName = "Jane Smith", Email = "jane@example.com" }
            };
        }

        public static List<Account> GetAccounts()
        {
            return new List<Account>
            {
                new Account
                {
                    Id = 1,
                    UserName = "admin",
                    PasswordHash = "hashed_password_here",
                    EmployeeId = 1,
                    RoleId = 1
                },
                new Account
                {
                    Id = 2,
                    UserName = "user",
                    PasswordHash = "hashed_password_here",
                    EmployeeId = 2,
                    RoleId = 2
                }
            };
        }

        public static List<Customer> GetCustomers()
        {
            return new List<Customer>
            {
                new Customer { Id = 1, CustomerName = "ABC Company", Phone = "0123456789", Address = "123 Main St" },
                new Customer { Id = 2, CustomerName = "XYZ Corporation", Phone = "0987654321", Address = "456 Oak Ave" },
                new Customer { Id = 3, CustomerName = "DEF Ltd", Phone = "0555666777", Address = "789 Pine Rd" }
            };
        }

        public static List<Product> GetProducts()
        {
            return new List<Product>
            {
                new Product { Id = 1, ProductName = "Glass Panel A", UnitPrice = 100000},
                new Product { Id = 2, ProductName = "Glass Panel B", UnitPrice = 150000 },
                new Product { Id = 3, ProductName = "Glass Frame", UnitPrice = 50000 }
            };
        }

        public static List<SaleOrder> GetSaleOrders()
        {
            return new List<SaleOrder>
            {
                new SaleOrder
                {
                    Id = 1,
                    CustomerId = 1,
                    OrderCode = "SO001",
                    OrderValue = 500000,
                    Status = Status.Processing,
                },
                new SaleOrder
                {
                    Id = 2,
                    CustomerId = 2,
                    OrderCode = "SO002",
                    OrderValue = 300000,
                    Status = Status.Processing,
                }
            };
        }

        public static List<OrderDetail> GetOrderDetails()
        {
            return new List<OrderDetail>
            {
                new OrderDetail
                {
                    Id = 1,
                    SaleOrderId = 1,
                    TotalAmount = 250000
                },
                new OrderDetail
                {
                    Id = 2,
                    SaleOrderId = 2,
                    TotalAmount = 150000
                }
            };
        }

        public static List<OrderDetailProduct> GetOrderDetailProducts()
        {
            return new List<OrderDetailProduct>
            {
                new OrderDetailProduct
                {
                    
                    OrderDetailId = 1,
                    ProductId = 1,
                    Quantity = 2,
                    TotalAmount = 100000
                },
                new OrderDetailProduct
                {

                    OrderDetailId = 1,
                    ProductId = 2,
                    Quantity = 1,
                    TotalAmount = 150000
                },
                new OrderDetailProduct
                {

                    OrderDetailId = 2,
                    ProductId = 2,
                    Quantity = 1,
                    TotalAmount = 150000
                },

            };
        }

        public static List<ProductionPlan> GetProductionPlans()
        {
            return new List<ProductionPlan>
            {
                new ProductionPlan
                {
                    Id = 1,
                    SaleOrderId = 1,
                    Status = "InProgress",
            
                },
                new ProductionPlan
                {
                    Id = 2,
                    SaleOrderId = 2,
                    Status = "Completed",

                }
            };
        }

        public static List<ProductionPlanDetail> GetProductionPlanDetails()
        {
            return new List<ProductionPlanDetail>
            {
                new ProductionPlanDetail
                {
                    Id = 1,
                    ProductionPlanId = 1,
                    ProductId = 1,
                    Quantity = 2,
                    Done = 2,
                    DaGiao = 0
                },
                new ProductionPlanDetail
                {
                    Id = 2,
                    ProductionPlanId = 1,
                    ProductId = 2,
                    Quantity = 1,
                    Done = 1,
                    DaGiao = 0
                },
                new ProductionPlanDetail
                {
                    Id = 3,
                    ProductionPlanId = 2,
                    ProductId = 3,
                    Quantity = 3,
                    Done = 3,
                    DaGiao = 0
                }
            };
        }

        public static List<Delivery> GetDeliveries()
        {
            return new List<Delivery>
            {
                new Delivery
                {
                    Id = 1,
                    SalesOrderId = 1,
                    DeliveryDate = DateTime.Now.AddDays(5),
                    ExportDate = DateTime.Now.AddDays(3),
                    Status = DeliveryStatus.Delivering,
                    Note = "Test delivery 1",
                    CreatedAt = DateTime.Now.AddDays(-5)
                },
                new Delivery
                {
                    Id = 2,
                    SalesOrderId = 2,
                    DeliveryDate = DateTime.Now.AddDays(10),
                    ExportDate = DateTime.Now.AddDays(8),
                    Status = DeliveryStatus.FullyDelivered,
                    Note = "Test delivery 2",
                    CreatedAt = DateTime.Now.AddDays(-3)
                }
            };
        }

        public static List<DeliveryDetail> GetDeliveryDetails()
        {
            return new List<DeliveryDetail>
            {
                new DeliveryDetail
                {
                    DeliveryDetailId = 1,
                    DeliveryId = 1,
                    ProductId = 1,
                    Quantity = 1,
                    Note = "Partial delivery",
                    CreatedAt = DateTime.Now.AddDays(-5)
                },
                new DeliveryDetail
                {
                    DeliveryDetailId = 2,
                    DeliveryId = 1,
                    ProductId = 2,
                    Quantity = 1,
                    Note = "Full delivery",
                    CreatedAt = DateTime.Now.AddDays(-5)
                },
                new DeliveryDetail
                {
                    DeliveryDetailId = 3,
                    DeliveryId = 2,
                    ProductId = 3,
                    Quantity = 3,
                    Note = "Complete delivery",
                    CreatedAt = DateTime.Now.AddDays(-3)
                }
            };
        }

        public static List<Invoice> GetInvoices()
        {
            return new List<Invoice>
            {
                new Invoice
                {
                    Id = 1,
                    CustomerId = 1,
                    InvoiceType = InvoiceType.Sales,
                    InvoiceDate = DateTime.Now.AddDays(-30),
                    DueDate = DateTime.Now.AddDays(30),
                    Subtotal = 500000,
                    Tax = 50000,
                    TotalAmount = 550000,
                    Status = InvoiceStatus.Unpaid,
                    SalesOrderId = 1
                },
                new Invoice
                {
                    Id = 2,
                    CustomerId = 2,
                    InvoiceType = InvoiceType.Sales,
                    InvoiceDate = DateTime.Now.AddDays(-15),
                    DueDate = DateTime.Now.AddDays(15),
                    Subtotal = 300000,
                    Tax = 30000,
                    TotalAmount = 330000,
                    Status = InvoiceStatus.Paid,
                    SalesOrderId = 2
                }
            };
        }

        public static List<InvoiceDetails> GetInvoiceDetails()
        {
            return new List<InvoiceDetails>
            {
                new InvoiceDetails
                {
                    Id = 1,
                    InvoiceId = 1,
                    ProductId = 1,
                    Quantity = 2,
                    UnitPrice = 100000,
                    Total = 200000
                },
                new InvoiceDetails
                {
                    Id = 2,
                    InvoiceId = 1,
                    ProductId = 2,
                    Quantity = 1,
                    UnitPrice = 150000,
                    Total = 150000
                },
                new InvoiceDetails
                {
                    Id = 3,
                    InvoiceId = 2,
                    ProductId = 3,
                    Quantity = 3,
                    UnitPrice = 50000,
                    Total = 150000
                }
            };
        }
    }
}
