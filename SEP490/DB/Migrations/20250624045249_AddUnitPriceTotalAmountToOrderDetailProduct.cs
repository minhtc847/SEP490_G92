using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class AddUnitPriceTotalAmountToOrderDetailProduct : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "total_amount",
                table: "order_detail_products",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "unit_price",
                table: "order_detail_products",
                type: "decimal(65,30)",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "total_amount",
                table: "order_detail_products");

            migrationBuilder.DropColumn(
                name: "unit_price",
                table: "order_detail_products");
        }
    }
}
