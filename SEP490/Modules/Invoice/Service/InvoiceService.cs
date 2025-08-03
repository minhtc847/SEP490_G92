using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Invoice.DTO;
using SEP490.Common.Services;
namespace SEP490.Modules.Invoice.Service
{
    public class InvoiceService : BaseService, IInvoiceService
    {
        private readonly SEP490DbContext _context;

        public InvoiceService(SEP490DbContext context)
        {
            _context = context;
        }

        public List<InvoiceDto> GetAllInvoices()
        {
            var invoices = _context.Invoices
                .Include(i => i.Customer)
                .OrderByDescending(i => i.InvoiceDate)
                .Select(i => new InvoiceDto
                {
                    Id = i.Id,
                    CustomerName = i.Customer.CustomerName,
                    InvoiceCode = $"INV{i.Id:D6}", // Generate invoice code format
                    InvoiceDate = i.InvoiceDate,
                    DueDate = i.DueDate,
                    InvoiceType = i.InvoiceType,
                    Status = i.Status,
                    Subtotal = i.Subtotal ?? 0,
                    Tax = i.Tax ?? 0,
                    TotalAmount = i.TotalAmount ?? 0,
                    SalesOrderId = i.SalesOrderId,
                    PurchaseOrderId = i.PurchaseOrderId
                })
                .ToList();

            // If no invoices exist, create sample data
            if (!invoices.Any())
            {
                var customers = _context.Customers.Take(3).ToList();
                if (customers.Any())
                {
                    var sampleInvoices = new List<InvoiceDto>
                    {
                        new InvoiceDto
                        {
                            Id = 1,
                            CustomerName = customers.First().CustomerName ?? "Khách hàng 1",
                            InvoiceCode = "INV000001",
                            InvoiceDate = DateTime.Now.AddDays(-30),
                            DueDate = DateTime.Now.AddDays(30),
                            InvoiceType = InvoiceType.Sales,
                            Status = InvoiceStatus.Paid,
                            Subtotal = 1000000,
                            Tax = 100000,
                            TotalAmount = 1100000,
                            SalesOrderId = 1
                        },
                        new InvoiceDto
                        {
                            Id = 2,
                            CustomerName = customers.Count > 1 ? customers[1].CustomerName ?? "Khách hàng 2" : "Khách hàng 2",
                            InvoiceCode = "INV000002",
                            InvoiceDate = DateTime.Now.AddDays(-15),
                            DueDate = DateTime.Now.AddDays(15),
                            InvoiceType = InvoiceType.Sales,
                            Status = InvoiceStatus.PartiallyPaid,
                            Subtotal = 2500000,
                            Tax = 250000,
                            TotalAmount = 2750000,
                            SalesOrderId = 2
                        },
                        new InvoiceDto
                        {
                            Id = 3,
                            CustomerName = customers.Count > 2 ? customers[2].CustomerName ?? "Khách hàng 3" : "Khách hàng 3",
                            InvoiceCode = "INV000003",
                            InvoiceDate = DateTime.Now.AddDays(-7),
                            DueDate = DateTime.Now.AddDays(23),
                            InvoiceType = InvoiceType.Purchase,
                            Status = InvoiceStatus.Unpaid,
                            Subtotal = 500000,
                            Tax = 50000,
                            TotalAmount = 550000,
                            PurchaseOrderId = 1
                        }
                    };
                    return sampleInvoices;
                }
            }

            return invoices;
        }
    }
} 