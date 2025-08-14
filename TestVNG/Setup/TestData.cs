using SEP490.DB.Models;
using System.Collections.Generic;

namespace TestVNG.Setup
{
    public static class TestData
    {
        public static List<GlassStructure> GetSampleGlassStructures()
        {
            return new List<GlassStructure>
            {
                new GlassStructure
                {
                    Id = 1,
                    ProductName = "Glass A",
                    ProductCode = "GLA001",
                    Category = "Double",
                    EdgeType = "Polished",
                    AdhesiveType = "UV",
                    GlassLayers = 2,
                    AdhesiveLayers = 1,
                    AdhesiveThickness = 0.5m,
                    UnitPrice = 200000,
                    Composition = "A+B"
                },
                new GlassStructure
                {
                    Id = 2,
                    ProductName = "Glass B",
                    ProductCode = "GLA001",
                    Category = "Double",
                    EdgeType = "Polished",
                    AdhesiveType = "UV",
                    GlassLayers = 2,
                    AdhesiveLayers = 1,
                    AdhesiveThickness = 0.5m,
                    UnitPrice = 200000,
                    Composition = "A+B"
                }

            };
        }

        public static List<Product> GetSampleProducts()
        {
            return new List<Product>
            {
                new Product
                {
                    Id = 1,
                    ProductCode = "PROD001",
                    ProductName = "Product 1",
                    ProductType = "Thành phẩm",
                    UOM = "Tấm",
                    Height = "200",
                    Width = "100",
                    Thickness = 5,
                    Weight = 10,
                    quantity = 5,
                    UnitPrice = 100000,
                    GlassStructureId = null 
                },
                new Product
                {
                    Id = 2,
                    ProductCode = "PROD002",
                    ProductName = "Product 2",
                    ProductType = "Thành phẩm",
                    UOM = "Tấm",
                    Height = "300",
                    Width = "150",
                    Thickness = 8,
                    Weight = 15,
                    quantity = 3,
                    UnitPrice = 160000,
                    GlassStructureId = 1
                }
            };
        }
        public static List<Customer> GetSampleCustomers()
        {
            return new List<Customer>
    {
        new Customer { Id = 1, CustomerName = "Customer A", Phone = "0901111111" },
        new Customer { Id = 2, CustomerName = "Customer B", Phone = "0902222222" }
    };
        }


        public static List<Invoice> GetSampleInvoices()
        {
            return new List<Invoice>
    {
        new Invoice
        {
            Id = 1,
            CustomerId = 1,
            InvoiceType = InvoiceType.Sales,
            InvoiceDate = DateTime.Now,
            TotalAmount = 500_000,
            Status = InvoiceStatus.Unpaid
        },
        new Invoice
        {
            Id = 2,
            CustomerId = 2,
            InvoiceType = InvoiceType.Purchase,
            InvoiceDate = DateTime.Now,
            TotalAmount = 1_000_000,
            Status = InvoiceStatus.Unpaid
        }
    };
        }

        public static List<Employee> GetSampleEmployees()
        {
            return new List<Employee>
            {
                new Employee { Id = 1, FullName = "Employee X" },
            };
        }

        public static List<PurchaseOrder> GetSamplePurchaseOrders()
        {
            var supplier = new Customer { Id = 10, CustomerName = "Supplier A", IsSupplier = true };
            var customer = new Customer { Id = 11, CustomerName = "Customer B" };
            var employee = new Employee { Id = 2, FullName = "Employee Y" };

            var product = new Product
            {
                Id = 100,
                ProductCode = "PROD100",
                ProductName = "Product Test",
                ProductType = "NVL",
                UOM = "Tấm",
                Height = "200",
                Width = "100",
                Thickness = 5,
                GlassStructureId = 1
            };

            return new List<PurchaseOrder>
    {
        new PurchaseOrder
        {
            Id = 1,
            Code = "MH00001",
            Date = DateTime.Now,
            Description = "Test Order",
            TotalValue = 500000,
            Status = PurchaseStatus.Pending,
            Supplier = supplier,
            Customer = customer,
            Employee = employee,
            PurchaseOrderDetails = new List<PurchaseOrderDetail>
            {
                new PurchaseOrderDetail
                {
                    Id = 1,
                    ProductId = product.Id,
                    Product = product,
                    ProductName = product.ProductName,
                    Quantity = 10,
                    UnitPrice = 200000,
                    TotalPrice = 2000000
                }
            }
        },
        new PurchaseOrder
        {
            Id = 2,
            Code = "MH00002",
            Date = DateTime.Now,
            Description = "Order with null Supplier/Customer",
            TotalValue = 300000,
            Status = PurchaseStatus.Pending,
            Supplier = null,
            Customer = null
        }
    };
        }

        public static List<SaleOrder> GetSampleSaleOrders()
        {
            return new List<SaleOrder>
    {
        new SaleOrder
        {
            Id = 1,
            OrderCode = "ĐH00001",
            OrderDate = DateTime.Today,
            CustomerId = 1,
            Status = Status.Pending,
            DeliveryStatus = DeliveryStatus.NotDelivered
        },
        new SaleOrder
        {
            Id = 2,
            OrderCode = "ĐH00002",
            OrderDate = DateTime.Today,
            CustomerId = 2,
            Status = Status.Pending,
            DeliveryStatus = DeliveryStatus.NotDelivered
        }
    };
        }

        public static List<OrderDetail> GetSampleOrderDetails()
        {
            return new List<OrderDetail>
    {
        new OrderDetail { Id = 1, SaleOrderId = 1 },
        new OrderDetail { Id = 2, SaleOrderId = 2 }
    };
        }

        public static List<OrderDetailProduct> GetSampleOrderDetailProducts()
        {
            return new List<OrderDetailProduct>
    {
        new OrderDetailProduct { OrderDetailId = 1, ProductId = 1, Quantity = 2 },
        new OrderDetailProduct { OrderDetailId = 2, ProductId = 2, Quantity = 1 }
    };
        }
    }
}
