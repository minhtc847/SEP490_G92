using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class AddQuantityToOrderDetailProduct : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "quantity",
                table: "order_details");

            migrationBuilder.AddColumn<int>(
                name: "quantity",
                table: "order_detail_products",
                type: "int",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "quantity",
                table: "order_detail_products");

            migrationBuilder.AddColumn<int>(
                name: "quantity",
                table: "order_details",
                type: "int",
                nullable: true);
        }
    }
}
