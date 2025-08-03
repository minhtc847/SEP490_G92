using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateChemicalExportKiet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_chemical_export_details_production_orders_production_order_id",
                table: "chemical_export_details");

            migrationBuilder.RenameColumn(
                name: "production_order_id",
                table: "chemical_export_details",
                newName: "chemical_export_id");

            migrationBuilder.RenameIndex(
                name: "ix_chemical_export_details_production_order_id",
                table: "chemical_export_details",
                newName: "ix_chemical_export_details_chemical_export_id");

            migrationBuilder.CreateTable(
                name: "chemical_exports",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    product_id = table.Column<int>(type: "int", nullable: true),
                    quantity = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    uom = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    note = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    production_order_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chemical_exports", x => x.id);
                    table.ForeignKey(
                        name: "fk_chemical_exports_production_orders_production_order_id",
                        column: x => x.production_order_id,
                        principalTable: "production_orders",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_chemical_exports_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_chemical_exports_product_id",
                table: "chemical_exports",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_chemical_exports_production_order_id",
                table: "chemical_exports",
                column: "production_order_id");

            migrationBuilder.AddForeignKey(
                name: "fk_chemical_export_details_chemical_exports_chemical_export_id",
                table: "chemical_export_details",
                column: "chemical_export_id",
                principalTable: "chemical_exports",
                principalColumn: "id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_chemical_export_details_chemical_exports_chemical_export_id",
                table: "chemical_export_details");

            migrationBuilder.DropTable(
                name: "chemical_exports");

            migrationBuilder.RenameColumn(
                name: "chemical_export_id",
                table: "chemical_export_details",
                newName: "production_order_id");

            migrationBuilder.RenameIndex(
                name: "ix_chemical_export_details_chemical_export_id",
                table: "chemical_export_details",
                newName: "ix_chemical_export_details_production_order_id");

            migrationBuilder.AddForeignKey(
                name: "fk_chemical_export_details_production_orders_production_order_id",
                table: "chemical_export_details",
                column: "production_order_id",
                principalTable: "production_orders",
                principalColumn: "id");
        }
    }
}
