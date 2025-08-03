using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SEP490.Modules.SalesOrder.ManageSalesOrder.Services;
using SEP490.Selenium.Product;

namespace SEP490.Modules.SalesOrder.ManageSalesOrder.Controllers
{
    [Route("api/test-table")]
    [ApiController]
    public class TestTableController : ControllerBase
    {
        private readonly ITestTableService _testTableService;
        private readonly IMisaProductService _misaProductService;

        public TestTableController(ITestTableService testTableService, IMisaProductService misaProductService)
        {
            _testTableService = testTableService;
            _misaProductService = misaProductService;
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
        [HttpGet("test")]
        public ActionResult getTest()
        {
            _misaProductService.AddProduct(new Selenium.Product.DTO.InputSingleProduct
            {
                Name = "Test Product",
                Type = "Hàng hóa",
                Unit = "m3"
            });
            return Ok("Test completed successfully.");
        }
    }
}
