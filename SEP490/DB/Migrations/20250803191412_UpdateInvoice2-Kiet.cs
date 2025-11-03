using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateInvoice2Kiet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "ix_invoice_details_product_id",
                table: "invoice_details",
                column: "product_id");

            migrationBuilder.AddForeignKey(
                name: "fk_invoice_details_products_product_id",
                table: "invoice_details",
                column: "product_id",
                principalTable: "products",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_invoice_details_products_product_id",
                table: "invoice_details");

            migrationBuilder.DropIndex(
                name: "ix_invoice_details_product_id",
                table: "invoice_details");
        }
    }
}
