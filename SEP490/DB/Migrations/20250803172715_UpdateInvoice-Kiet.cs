using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateInvoiceKiet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "related_order_id",
                table: "invoices",
                newName: "sales_order_id");

            migrationBuilder.AddColumn<int>(
                name: "purchase_order_id",
                table: "invoices",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_invoices_purchase_order_id",
                table: "invoices",
                column: "purchase_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_invoices_sales_order_id",
                table: "invoices",
                column: "sales_order_id");

            migrationBuilder.AddForeignKey(
                name: "fk_invoices_purchase_orders_purchase_order_id",
                table: "invoices",
                column: "purchase_order_id",
                principalTable: "purchase_orders",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_invoices_sale_orders_sales_order_id",
                table: "invoices",
                column: "sales_order_id",
                principalTable: "sale_orders",
                principalColumn: "id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_invoices_purchase_orders_purchase_order_id",
                table: "invoices");

            migrationBuilder.DropForeignKey(
                name: "fk_invoices_sale_orders_sales_order_id",
                table: "invoices");

            migrationBuilder.DropIndex(
                name: "ix_invoices_purchase_order_id",
                table: "invoices");

            migrationBuilder.DropIndex(
                name: "ix_invoices_sales_order_id",
                table: "invoices");

            migrationBuilder.DropColumn(
                name: "purchase_order_id",
                table: "invoices");

            migrationBuilder.RenameColumn(
                name: "sales_order_id",
                table: "invoices",
                newName: "related_order_id");
        }
    }
}
