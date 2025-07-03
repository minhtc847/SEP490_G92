using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class AddProductNameForGlassStructure : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "total_amount",
                table: "order_details");

            migrationBuilder.AddColumn<string>(
                name: "product_name",
                table: "glass_structures",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "product_name",
                table: "glass_structures");

            migrationBuilder.AddColumn<decimal>(
                name: "total_amount",
                table: "order_details",
                type: "decimal(65,30)",
                nullable: true);
        }
    }
}
