using Microsoft.EntityFrameworkCore;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.Debts.DTO;
using SEP490.Modules.PaymentsModule.Service;
using SEP490.Common.Services;

namespace SEP490.Modules.Debts.Service
{
    public class DebtService : BaseScopedService, IDebtService
    {
        private readonly SEP490DbContext _context;
        private readonly IPaymentService _paymentService;

        public DebtService(SEP490DbContext context, IPaymentService paymentService)
        {
            _context = context;
            _paymentService = paymentService;
        }

        public List<DebtDto> GetAllDebts()
        {
            var customers = _context.Customers
                .Include(c => c.Invoices)
                .ThenInclude(i => i.InvoiceDetails)
                .ToList();

            var debtDtos = new List<DebtDto>();

            foreach (var customer in customers)
            {
                var debt = CalculateCustomerDebt(customer);
                if (debt != null)
                {
                    debtDtos.Add(debt);
                }
            }

            return debtDtos.OrderByDescending(d => Math.Abs(d.NetDebt)).ToList();
        }

        public DebtDto? GetDebtByCustomerId(int customerId)
        {
            var customer = _context.Customers
                .Include(c => c.Invoices)
                .ThenInclude(i => i.InvoiceDetails)
                .FirstOrDefault(c => c.Id == customerId);

            if (customer == null)
                return null;

            return CalculateCustomerDebt(customer);
        }

        public DebtSummaryDto GetDebtSummary()
        {
            var allDebts = GetAllDebts();
            
            return new DebtSummaryDto
            {
                TotalCustomers = allDebts.Count,
                TotalReceivable = allDebts.Sum(d => d.TotalReceivable),
                TotalPayable = allDebts.Sum(d => d.TotalPayable),
                NetDebt = allDebts.Sum(d => d.NetDebt),
                CustomersWithDebt = allDebts.Count(d => d.NetDebt < 0),
                CustomersWithReceivable = allDebts.Count(d => d.NetDebt > 0)
            };
        }

        public void UpdateDebtFromInvoice(int invoiceId)
        {
            var invoice = _context.Invoices
                .Include(i => i.Customer)
                .FirstOrDefault(i => i.Id == invoiceId);

            if (invoice != null)
            {
                // Trigger recalculation for this customer
                var customer = _context.Customers
                    .Include(c => c.Invoices)
                    .ThenInclude(i => i.InvoiceDetails)
                    .FirstOrDefault(c => c.Id == invoice.CustomerId);

                if (customer != null)
                {
                    // The debt will be recalculated when accessed
                    // This method can be used to trigger updates when needed
                }
            }
        }

        public void UpdateAllDebts()
        {
            // This method can be used to trigger a full recalculation
            // In this implementation, debts are calculated on-demand
        }

        public List<DebtDto> GetDebtsByFilter(string? customerName, int? debtType, decimal? minAmount, decimal? maxAmount)
        {
            var allDebts = GetAllDebts();

            var filteredDebts = allDebts.AsQueryable();

            if (!string.IsNullOrEmpty(customerName))
            {
                filteredDebts = filteredDebts.Where(d => 
                    d.CustomerName.Contains(customerName, StringComparison.OrdinalIgnoreCase));
            }

            if (debtType.HasValue)
            {
                switch (debtType.Value)
                {
                    case 1: // Chỉ có phải thu
                        filteredDebts = filteredDebts.Where(d => d.NetDebt > 0);
                        break;
                    case 2: // Chỉ có phải trả
                        filteredDebts = filteredDebts.Where(d => d.NetDebt < 0);
                        break;
                    case 3: // Cân bằng
                        filteredDebts = filteredDebts.Where(d => d.NetDebt == 0);
                        break;
                }
            }

            if (minAmount.HasValue)
            {
                filteredDebts = filteredDebts.Where(d => Math.Abs(d.NetDebt) >= minAmount.Value);
            }

            if (maxAmount.HasValue)
            {
                filteredDebts = filteredDebts.Where(d => Math.Abs(d.NetDebt) <= maxAmount.Value);
            }

            return filteredDebts.ToList();
        }

        private DebtDto? CalculateCustomerDebt(Customer customer)
        {
            var invoices = customer.Invoices.Where(i => i.Status != InvoiceStatus.Paid).ToList();
            
            if (!invoices.Any())
                return null;

            var debtInvoices = new List<DebtInvoiceDto>();
            decimal totalReceivable = 0;
            decimal totalPayable = 0;

            foreach (var invoice in invoices)
            {
                var totalPaid = _paymentService.GetTotalPaidAmount(invoice.Id);
                var remainingAmount = (invoice.TotalAmount ?? 0) - totalPaid;

                if (remainingAmount <= 0)
                    continue;

                var debtInvoice = new DebtInvoiceDto
                {
                    InvoiceId = invoice.Id,
                    InvoiceCode = $"INV{invoice.Id:D6}",
                    InvoiceDate = invoice.InvoiceDate,
                    DueDate = invoice.DueDate,
                    InvoiceType = (int)invoice.InvoiceType,
                    TotalAmount = invoice.TotalAmount ?? 0,
                    PaidAmount = totalPaid,
                    RemainingAmount = remainingAmount,
                    Status = (int)invoice.Status,
                    StatusText = GetStatusText(invoice.Status),
                    TypeText = GetInvoiceTypeText(invoice.InvoiceType)
                };

                debtInvoices.Add(debtInvoice);

                if (invoice.InvoiceType == InvoiceType.Sales)
                {
                    totalReceivable += remainingAmount;
                }
                else if (invoice.InvoiceType == InvoiceType.Purchase)
                {
                    totalPayable += remainingAmount;
                }
            }

            if (!debtInvoices.Any())
                return null;

            return new DebtDto
            {
                Id = customer.Id,
                CustomerId = customer.Id,
                CustomerName = customer.CustomerName,
                CustomerCode = customer.CustomerCode ?? "",
                CustomerPhone = customer.Phone ?? "",
               
                TotalReceivable = totalReceivable,
                TotalPayable = totalPayable,
                NetDebt = totalReceivable - totalPayable,
                LastUpdated = DateTime.Now,
                Invoices = debtInvoices.OrderByDescending(i => i.InvoiceDate).ToList()
            };
        }

        private string GetStatusText(InvoiceStatus status)
        {
            return status switch
            {
                InvoiceStatus.Unpaid => "Chưa thanh toán",
                InvoiceStatus.PartiallyPaid => "Thanh toán một phần",
                InvoiceStatus.Paid => "Đã thanh toán",
                _ => "Không xác định"
            };
        }

        private string GetInvoiceTypeText(InvoiceType type)
        {
            return type switch
            {
                InvoiceType.Sales => "Bán hàng",
                InvoiceType.Purchase => "Mua hàng",
                _ => "Không xác định"
            };
        }
    }
} 