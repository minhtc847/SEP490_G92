using SEP490.Modules.ProductionOrders.DTO;
using System.Collections.Generic;

namespace SEP490.Modules.ProductionOrders.Services
{
    public interface ICutGlassInvoiceService
    {
        CutGlassInvoiceDetailDto GetByProductionOrderId(int productionOrderId);

        void SaveCutGlassInvoice(SaveCutGlassInvoiceRequestDto request);
    }
} 