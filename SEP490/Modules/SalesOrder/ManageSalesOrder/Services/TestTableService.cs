using SEP490.Common.Services;
using SEP490.DB;
using SEP490.DB.Models;

namespace SEP490.Modules.SalesOrder.ManageSalesOrder.Services
{
    public class TestTableService: BaseService, ITestTableService
    {
        private readonly SEP490DbContext _context;
        public TestTableService(SEP490DbContext context)
        {
            _context = context;
        }
        public List<TestTable> GetAll() {
            return _context.TestTable.ToList();
        }
    }
}
