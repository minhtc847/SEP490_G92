using Microsoft.EntityFrameworkCore;
using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;
using SEP490.Modules.ProductionOrders.DTO;

namespace SEP490.Modules.ProductionOrders.Services
{
    public class ExportInvoiceService : BaseService
    {
        private readonly SEP490DbContext _context;

        public ExportInvoiceService(SEP490DbContext context)
        {
            _context = context;
        }

       
    }
} 