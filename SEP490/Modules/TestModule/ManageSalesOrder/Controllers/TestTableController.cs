using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.SalesOrder.ManageSalesOrder.Services;

namespace SEP490.Modules.SalesOrder.ManageSalesOrder.Controllers
{
    [Route("api/test-table")]
    [ApiController]
    public class TestTableController : ControllerBase
    {
        private readonly ITestTableService _testTableService;

        public TestTableController(ITestTableService testTableService)
        {
            _testTableService = testTableService;
        }

        [HttpGet]
        public ActionResult<List<DB.Models.TestTable>> GetAll()
        {
            var result = _testTableService.GetAll();
            if (result == null || !result.Any())
            {
                return NotFound("No records found.");
            }
            return Ok(result);
        }
    }
}
