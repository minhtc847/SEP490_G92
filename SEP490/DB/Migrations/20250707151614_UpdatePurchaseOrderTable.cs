using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdatePurchaseOrderTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "customer_id",
                table: "purchase_orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "product_id",
                table: "purchase_order_details",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "ix_purchase_orders_customer_id",
                table: "purchase_orders",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_order_details_product_id",
                table: "purchase_order_details",
                column: "product_id");

            migrationBuilder.AddForeignKey(
                name: "fk_purchase_order_details_products_product_id",
                table: "purchase_order_details",
                column: "product_id",
                principalTable: "products",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_purchase_orders_customers_customer_id",
                table: "purchase_orders",
                column: "customer_id",
                principalTable: "customers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_purchase_order_details_products_product_id",
                table: "purchase_order_details");

            migrationBuilder.DropForeignKey(
                name: "fk_purchase_orders_customers_customer_id",
                table: "purchase_orders");

            migrationBuilder.DropIndex(
                name: "ix_purchase_orders_customer_id",
                table: "purchase_orders");

            migrationBuilder.DropIndex(
                name: "ix_purchase_order_details_product_id",
                table: "purchase_order_details");

            migrationBuilder.DropColumn(
                name: "customer_id",
                table: "purchase_orders");

            migrationBuilder.DropColumn(
                name: "product_id",
                table: "purchase_order_details");
        }
    }
}
