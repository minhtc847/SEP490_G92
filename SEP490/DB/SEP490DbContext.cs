using Microsoft.EntityFrameworkCore;
using SEP490.DB.Models;

namespace SEP490.DB
{
    public class SEP490DbContext : DbContext
    {
        public SEP490DbContext(DbContextOptions<SEP490DbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Add any additional model configurations here
        }

        // Define DbSet properties for your entities here
        public DbSet<TestTable> TestTable { get; set; }


    }
}
