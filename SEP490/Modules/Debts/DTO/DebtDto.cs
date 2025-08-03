using System.ComponentModel.DataAnnotations;

namespace SEP490.Modules.Debts.DTO
{
    public class DebtDto
    {
        public int Id { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerCode { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public decimal TotalReceivable { get; set; } // Tổng phải thu (hóa đơn bán chưa thanh toán)
        public decimal TotalPayable { get; set; } // Tổng phải trả (hóa đơn mua chưa thanh toán)
        public decimal NetDebt { get; set; } // Công nợ ròng (Receivable - Payable)
        public DateTime LastUpdated { get; set; }
        public List<DebtInvoiceDto> Invoices { get; set; } = new List<DebtInvoiceDto>();
    }

    public class DebtInvoiceDto
    {
        public int InvoiceId { get; set; }
        public string InvoiceCode { get; set; } = string.Empty;
        public DateTime InvoiceDate { get; set; }
        public DateTime? DueDate { get; set; }
        public int InvoiceType { get; set; } // 0: Sales, 1: Purchase
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal RemainingAmount { get; set; }
        public int Status { get; set; } // 0: Unpaid, 1: PartiallyPaid, 2: Paid
        public string StatusText { get; set; } = string.Empty;
        public string TypeText { get; set; } = string.Empty;
    }

    public class DebtSummaryDto
    {
        public int TotalCustomers { get; set; }
        public decimal TotalReceivable { get; set; }
        public decimal TotalPayable { get; set; }
        public decimal NetDebt { get; set; }
        public int CustomersWithDebt { get; set; }
        public int CustomersWithReceivable { get; set; }
    }

    public class CreateDebtDto
    {
        [Required]
        public int CustomerId { get; set; }
        
        [Required]
        public int InvoiceId { get; set; }
        
        [Required]
        public int InvoiceType { get; set; }
        
        [Required]
        public decimal TotalAmount { get; set; }
        
        public DateTime? DueDate { get; set; }
    }
} 