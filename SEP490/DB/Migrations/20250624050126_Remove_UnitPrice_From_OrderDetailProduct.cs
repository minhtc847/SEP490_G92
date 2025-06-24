using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class Remove_UnitPrice_From_OrderDetailProduct : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "unit_price",
                table: "order_details");

            migrationBuilder.DropColumn(
                name: "unit_price",
                table: "order_detail_products");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "unit_price",
                table: "order_details",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "unit_price",
                table: "order_detail_products",
                type: "decimal(65,30)",
                nullable: true);
        }
    }
}
