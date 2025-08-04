using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using SEP490.DB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestVNG.Setup
{
    public class TestBase
    {
        protected SEP490DbContext CreateInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<SEP490DbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new SEP490DbContext(options);
        }

        protected IConfiguration CreateMockConfiguration()
        {
            var mockConfig = new Mock<IConfiguration>();
            mockConfig.Setup(x => x["Jwt:Key"]).Returns("your-super-secret-key-with-at-least-32-characters");
            mockConfig.Setup(x => x["Jwt:Issuer"]).Returns("VNG_Glass");
            mockConfig.Setup(x => x["Jwt:Audience"]).Returns("VNG_Glass_Users");
            mockConfig.Setup(x => x["Jwt:ExpiryInMinutes"]).Returns("60");

            return mockConfig.Object;
        }

        protected void SeedTestData(SEP490DbContext context)
        {
            context.GlassStructures.AddRange(TestData.GetSampleGlassStructures());
            context.Products.AddRange(TestData.GetSampleProducts());
            context.SaveChanges();
        }

    }
}
