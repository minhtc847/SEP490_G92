using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.PaymentsModule.DTO;
using SEP490.Common.Services;

namespace SEP490.Modules.PaymentsModule.Service
{
    public class PaymentService : BaseService, IPaymentService
    {
        private readonly SEP490DbContext _context;

        public PaymentService(SEP490DbContext context)
        {
            _context = context;
        }

        public List<PaymentDto> GetPaymentsByInvoiceId(int invoiceId)
        {
            var payments = _context.Payments
                .Include(p => p.Customer)
                .Where(p => p.InvoiceId == invoiceId)
                .OrderByDescending(p => p.PaymentDate)
                .Select(p => new PaymentDto
                {
                    Id = p.Id,
                    CustomerId = p.CustomerId,
                    InvoiceId = p.InvoiceId,
                    InvoiceType = (int)p.InvoiceType,
                    PaymentDate = p.PaymentDate,
                    Amount = p.Amount,
                    Note = p.Note,
                    CreatedAt = p.CreatedAt,
                    CustomerName = p.Customer.CustomerName
                })
                .ToList();

            return payments;
        }

        public PaymentDto? GetPaymentById(int id)
        {
            var payment = _context.Payments
                .Include(p => p.Customer)
                .FirstOrDefault(p => p.Id == id);

            if (payment == null)
                return null;

            return new PaymentDto
            {
                Id = payment.Id,
                CustomerId = payment.CustomerId,
                InvoiceId = payment.InvoiceId,
                InvoiceType = (int)payment.InvoiceType,
                PaymentDate = payment.PaymentDate,
                Amount = payment.Amount,
                Note = payment.Note,
                CreatedAt = payment.CreatedAt,
                CustomerName = payment.Customer.CustomerName
            };
        }

        public int CreatePayment(CreatePaymentDto createPaymentDto)
        {
            // Validate invoice exists
            var invoice = _context.Invoices.FirstOrDefault(i => i.Id == createPaymentDto.InvoiceId);
            if (invoice == null)
                throw new ArgumentException("Invoice not found");

            // Validate customer exists
            var customer = _context.Customers.FirstOrDefault(c => c.Id == createPaymentDto.CustomerId);
            if (customer == null)
                throw new ArgumentException("Customer not found");

            // Check if payment amount exceeds remaining amount
            var totalPaid = GetTotalPaidAmount(createPaymentDto.InvoiceId);
            var remainingAmount = (invoice.TotalAmount ?? 0) - totalPaid;
            
            if (createPaymentDto.Amount > remainingAmount)
                throw new ArgumentException("Payment amount exceeds remaining invoice amount");

            var payment = new Payments
            {
                CustomerId = createPaymentDto.CustomerId,
                InvoiceId = createPaymentDto.InvoiceId,
                InvoiceType = (InvoiceType)createPaymentDto.InvoiceType,
                PaymentDate = createPaymentDto.PaymentDate,
                Amount = createPaymentDto.Amount,
                Note = createPaymentDto.Note,
                CreatedAt = DateTime.Now
            };

            _context.Payments.Add(payment);
            _context.SaveChanges();

            // Update invoice status after payment
            UpdateInvoiceStatus(createPaymentDto.InvoiceId);

            return payment.Id;
        }

        public bool UpdatePayment(int id, CreatePaymentDto updatePaymentDto)
        {
            var payment = _context.Payments.FirstOrDefault(p => p.Id == id);
            if (payment == null)
                return false;

            // Validate invoice exists
            var invoice = _context.Invoices.FirstOrDefault(i => i.Id == updatePaymentDto.InvoiceId);
            if (invoice == null)
                throw new ArgumentException("Invoice not found");

            // Check if new payment amount exceeds remaining amount (excluding current payment)
            var totalPaid = GetTotalPaidAmount(updatePaymentDto.InvoiceId) - payment.Amount;
            var remainingAmount = (invoice.TotalAmount ?? 0) - totalPaid;
            
            if (updatePaymentDto.Amount > remainingAmount)
                throw new ArgumentException("Payment amount exceeds remaining invoice amount");

            payment.CustomerId = updatePaymentDto.CustomerId;
            payment.InvoiceId = updatePaymentDto.InvoiceId;
            payment.InvoiceType = (InvoiceType)updatePaymentDto.InvoiceType;
            payment.PaymentDate = updatePaymentDto.PaymentDate;
            payment.Amount = updatePaymentDto.Amount;
            payment.Note = updatePaymentDto.Note;

            _context.SaveChanges();

            // Update invoice status after payment update
            UpdateInvoiceStatus(updatePaymentDto.InvoiceId);

            return true;
        }

        public bool DeletePayment(int id)
        {
            var payment = _context.Payments.FirstOrDefault(p => p.Id == id);
            if (payment == null)
                return false;

            var invoiceId = payment.InvoiceId;
            _context.Payments.Remove(payment);
            _context.SaveChanges();

            // Update invoice status after payment deletion
            UpdateInvoiceStatus(invoiceId);

            return true;
        }

        public decimal GetTotalPaidAmount(int invoiceId)
        {
            return _context.Payments
                .Where(p => p.InvoiceId == invoiceId)
                .Sum(p => p.Amount);
        }

        public void UpdateInvoiceStatus(int invoiceId)
        {
            var invoice = _context.Invoices.FirstOrDefault(i => i.Id == invoiceId);
            if (invoice == null)
                return;

            var totalPaid = GetTotalPaidAmount(invoiceId);
            var totalAmount = invoice.TotalAmount ?? 0;

            if (totalPaid >= totalAmount)
            {
                invoice.Status = InvoiceStatus.Paid;
            }
            else if (totalPaid > 0)
            {
                invoice.Status = InvoiceStatus.PartiallyPaid;
            }
            else
            {
                invoice.Status = InvoiceStatus.Unpaid;
            }

            _context.SaveChanges();
        }
    }
} 