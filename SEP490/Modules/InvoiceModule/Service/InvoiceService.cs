using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.InvoiceModule.DTO;
using SEP490.Modules.PaymentsModule.DTO;
using SEP490.Modules.PaymentsModule.Service;
using SEP490.Common.Services;

namespace SEP490.Modules.InvoiceModule.Service
{
    public class InvoiceService : BaseService, IInvoiceService
    {
        private readonly SEP490DbContext _context;
        private readonly IPaymentService _paymentService;

        public InvoiceService(SEP490DbContext context, IPaymentService paymentService)
        {
            _context = context;
            _paymentService = paymentService;
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

            return invoices;
        }

        public InvoiceWithDetailsDto? GetInvoiceById(int id)
        {
            var invoice = _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.InvoiceDetails)
                .ThenInclude(id => id.Product)
                .FirstOrDefault(i => i.Id == id);

            if (invoice == null)
                return null;

            return new InvoiceWithDetailsDto
            {
                Id = invoice.Id,
                CustomerName = invoice.Customer.CustomerName,
                InvoiceCode = $"INV{invoice.Id:D6}",
                InvoiceDate = invoice.InvoiceDate,
                DueDate = invoice.DueDate,
                InvoiceType = invoice.InvoiceType,
                Status = invoice.Status,
                Subtotal = invoice.Subtotal ?? 0,
                Tax = invoice.Tax ?? 0,
                TotalAmount = invoice.TotalAmount ?? 0,
                SalesOrderId = invoice.SalesOrderId,
                PurchaseOrderId = invoice.PurchaseOrderId,
                InvoiceDetails = invoice.InvoiceDetails.Select(id => new InvoiceDetailDto
                {
                    Id = id.Id,
                    InvoiceId = id.InvoiceId,
                    ProductId = id.ProductId,
                    ProductName = id.Product.ProductName,
                    Quantity = id.Quantity,
                    UnitPrice = id.UnitPrice,
                    Total = id.Total,
                    
                }).ToList()
            };
        }

        public InvoiceWithPaymentsDto? GetInvoiceWithPayments(int id)
        {
            var invoice = _context.Invoices
                .Include(i => i.Customer)
                .Include(i => i.InvoiceDetails)
                .ThenInclude(id => id.Product)
                .FirstOrDefault(i => i.Id == id);

            if (invoice == null)
                return null;

            var payments = _paymentService.GetPaymentsByInvoiceId(id);
            var totalPaidAmount = _paymentService.GetTotalPaidAmount(id);
            var remainingAmount = (invoice.TotalAmount ?? 0) - totalPaidAmount;

            return new InvoiceWithPaymentsDto
            {
                Id = invoice.Id,
                CustomerId = invoice.CustomerId,
                CustomerName = invoice.Customer.CustomerName,
                InvoiceCode = $"INV{invoice.Id:D6}",
                InvoiceDate = invoice.InvoiceDate,
                DueDate = invoice.DueDate,
                InvoiceType = invoice.InvoiceType,
                Status = invoice.Status,
                Subtotal = invoice.Subtotal ?? 0,
                Tax = invoice.Tax ?? 0,
                TotalAmount = invoice.TotalAmount ?? 0,
                SalesOrderId = invoice.SalesOrderId,
                PurchaseOrderId = invoice.PurchaseOrderId,
                InvoiceDetails = invoice.InvoiceDetails.Select(id => new InvoiceDetailDto
                {
                    Id = id.Id,
                    InvoiceId = id.InvoiceId,
                    ProductId = id.ProductId,
                    ProductName = id.Product.ProductName,
                    Quantity = id.Quantity,
                    UnitPrice = id.UnitPrice,
                    Total = id.Total,
                    
                }).ToList(),
                Payments = payments,
                TotalPaidAmount = totalPaidAmount,
                RemainingAmount = remainingAmount
            };
        }

        public int CreateInvoice(CreateInvoiceDto createInvoiceDto)
        {
            try
            {
                // Validate input data
                if (createInvoiceDto.CustomerId <= 0)
                    throw new ArgumentException("CustomerId must be greater than 0");
                
                if (createInvoiceDto.InvoiceDetails == null || !createInvoiceDto.InvoiceDetails.Any())
                    throw new ArgumentException("Invoice must have at least one detail");

                // Check if customer exists
                var customer = _context.Customers.Find(createInvoiceDto.CustomerId);
                if (customer == null)
                    throw new ArgumentException($"Customer with ID {createInvoiceDto.CustomerId} not found");

                using var transaction = _context.Database.BeginTransaction();
                
                // Generate unique invoice code
                var today = DateTime.Now;
                var existingInvoicesToday = _context.Invoices
                    .Where(i => i.InvoiceDate.Date == today.Date)
                    .Count();
                
                var invoiceCode = $"INV{today:yyyyMMdd}{(existingInvoicesToday + 1):D3}";

                var invoice = new Invoice
                {
                    CustomerId = createInvoiceDto.CustomerId,
                    InvoiceType = createInvoiceDto.InvoiceType,
                    InvoiceDate = createInvoiceDto.InvoiceDate,
                    DueDate = createInvoiceDto.DueDate,
                    Subtotal = createInvoiceDto.Subtotal,
                    Tax = createInvoiceDto.Tax,
                    TotalAmount = createInvoiceDto.TotalAmount,
                    Status = createInvoiceDto.Status,
                    SalesOrderId = createInvoiceDto.SalesOrderId,
                    PurchaseOrderId = createInvoiceDto.PurchaseOrderId
                };

                _context.Invoices.Add(invoice);
                _context.SaveChanges();

                // Add invoice details
                foreach (var detail in createInvoiceDto.InvoiceDetails)
                {
                    // Check if product exists
                    var product = _context.Products.Find(detail.ProductId);
                    if (product == null)
                        throw new ArgumentException($"Product with ID {detail.ProductId} not found");

                    var invoiceDetail = new InvoiceDetails
                    {
                        InvoiceId = invoice.Id,
                        ProductId = detail.ProductId,
                        Quantity = detail.Quantity,
                        UnitPrice = detail.UnitPrice,
                        Total = detail.Total
                    };

                    _context.InvoiceDetails.Add(invoiceDetail);
                }

                _context.SaveChanges();
                transaction.Commit();
                return invoice.Id;
            }
            catch (Exception ex)
            {
                // Log the error details
                Console.WriteLine($"Error creating invoice: {ex.Message}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                throw;
            }
        }

        public bool UpdateInvoice(int id, CreateInvoiceDto updateInvoiceDto)
        {
            var invoice = _context.Invoices.Find(id);
            if (invoice == null)
                return false;

            invoice.CustomerId = updateInvoiceDto.CustomerId;
            invoice.InvoiceType = updateInvoiceDto.InvoiceType;
            invoice.InvoiceDate = updateInvoiceDto.InvoiceDate;
            invoice.DueDate = updateInvoiceDto.DueDate;
            invoice.Subtotal = updateInvoiceDto.Subtotal;
            invoice.Tax = updateInvoiceDto.Tax;
            invoice.TotalAmount = updateInvoiceDto.TotalAmount;
            invoice.Status = updateInvoiceDto.Status;
            invoice.SalesOrderId = updateInvoiceDto.SalesOrderId;
            invoice.PurchaseOrderId = updateInvoiceDto.PurchaseOrderId;

            // Remove existing details
            var existingDetails = _context.InvoiceDetails.Where(id => id.InvoiceId == invoice.Id);
            _context.InvoiceDetails.RemoveRange(existingDetails);

            // Add new details
            foreach (var detail in updateInvoiceDto.InvoiceDetails)
            {
                var invoiceDetail = new InvoiceDetails
                {
                    InvoiceId = invoice.Id,
                    ProductId = detail.ProductId,
                    Quantity = detail.Quantity,
                    UnitPrice = detail.UnitPrice,
                    Total = detail.Total
                };

                _context.InvoiceDetails.Add(invoiceDetail);
            }

            _context.SaveChanges();
            return true;
        }

        public bool DeleteInvoice(int id)
        {
            var invoice = _context.Invoices.Find(id);
            if (invoice == null)
                return false;

            // Remove invoice details first
            var details = _context.InvoiceDetails.Where(id => id.InvoiceId == invoice.Id);
            _context.InvoiceDetails.RemoveRange(details);

            // Remove invoice
            _context.Invoices.Remove(invoice);
            _context.SaveChanges();

            return true;
        }
    }
} 