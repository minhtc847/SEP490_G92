using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class AddZaloOrderDetailKiet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "height",
                table: "zalo_order_details",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "product_code",
                table: "zalo_order_details",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "thickness",
                table: "zalo_order_details",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "width",
                table: "zalo_order_details",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "height",
                table: "zalo_order_details");

            migrationBuilder.DropColumn(
                name: "product_code",
                table: "zalo_order_details");

            migrationBuilder.DropColumn(
                name: "thickness",
                table: "zalo_order_details");

            migrationBuilder.DropColumn(
                name: "width",
                table: "zalo_order_details");
        }
    }
}
