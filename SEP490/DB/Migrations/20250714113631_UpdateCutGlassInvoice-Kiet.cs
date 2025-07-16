using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateCutGlassInvoiceKiet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_chemical_export_details_export_invoices_export_invoice_id",
                table: "chemical_export_details");

            migrationBuilder.DropForeignKey(
                name: "fk_cut_glass_invoice_materials_export_invoices_export_invoice_id",
                table: "cut_glass_invoice_materials");

            migrationBuilder.DropTable(
                name: "export_invoices");

            migrationBuilder.DropIndex(
                name: "ix_chemical_export_details_export_invoice_id",
                table: "chemical_export_details");

            migrationBuilder.DropColumn(
                name: "output_name",
                table: "cut_glass_invoice_outputs");

            migrationBuilder.DropColumn(
                name: "material_name",
                table: "cut_glass_invoice_materials");

            migrationBuilder.RenameColumn(
                name: "output_type",
                table: "cut_glass_invoice_outputs",
                newName: "production_output_id");

            migrationBuilder.RenameColumn(
                name: "material_type",
                table: "cut_glass_invoice_materials",
                newName: "production_order_id");

            migrationBuilder.RenameColumn(
                name: "export_invoice_id",
                table: "cut_glass_invoice_materials",
                newName: "product_id");

            migrationBuilder.RenameIndex(
                name: "ix_cut_glass_invoice_materials_export_invoice_id",
                table: "cut_glass_invoice_materials",
                newName: "ix_cut_glass_invoice_materials_product_id");

            migrationBuilder.CreateIndex(
                name: "ix_cut_glass_invoice_outputs_production_output_id",
                table: "cut_glass_invoice_outputs",
                column: "production_output_id");

            migrationBuilder.CreateIndex(
                name: "ix_cut_glass_invoice_materials_production_order_id",
                table: "cut_glass_invoice_materials",
                column: "production_order_id");

            migrationBuilder.AddForeignKey(
                name: "fk_cut_glass_invoice_materials_production_orders_production_ord",
                table: "cut_glass_invoice_materials",
                column: "production_order_id",
                principalTable: "production_orders",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_cut_glass_invoice_materials_products_product_id",
                table: "cut_glass_invoice_materials",
                column: "product_id",
                principalTable: "products",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_cut_glass_invoice_outputs_production_outputs_production_outp",
                table: "cut_glass_invoice_outputs",
                column: "production_output_id",
                principalTable: "production_outputs",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_cut_glass_invoice_materials_production_orders_production_ord",
                table: "cut_glass_invoice_materials");

            migrationBuilder.DropForeignKey(
                name: "fk_cut_glass_invoice_materials_products_product_id",
                table: "cut_glass_invoice_materials");

            migrationBuilder.DropForeignKey(
                name: "fk_cut_glass_invoice_outputs_production_outputs_production_outp",
                table: "cut_glass_invoice_outputs");

            migrationBuilder.DropIndex(
                name: "ix_cut_glass_invoice_outputs_production_output_id",
                table: "cut_glass_invoice_outputs");

            migrationBuilder.DropIndex(
                name: "ix_cut_glass_invoice_materials_production_order_id",
                table: "cut_glass_invoice_materials");

            migrationBuilder.RenameColumn(
                name: "production_output_id",
                table: "cut_glass_invoice_outputs",
                newName: "output_type");

            migrationBuilder.RenameColumn(
                name: "production_order_id",
                table: "cut_glass_invoice_materials",
                newName: "material_type");

            migrationBuilder.RenameColumn(
                name: "product_id",
                table: "cut_glass_invoice_materials",
                newName: "export_invoice_id");

            migrationBuilder.RenameIndex(
                name: "ix_cut_glass_invoice_materials_product_id",
                table: "cut_glass_invoice_materials",
                newName: "ix_cut_glass_invoice_materials_export_invoice_id");

            migrationBuilder.AddColumn<string>(
                name: "output_name",
                table: "cut_glass_invoice_outputs",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "material_name",
                table: "cut_glass_invoice_materials",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "export_invoices",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    production_order_id = table.Column<int>(type: "int", nullable: false),
                    employee_id = table.Column<int>(type: "int", nullable: true),
                    employee_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    export_date = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    note = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<int>(type: "int", nullable: true),
                    total_amount = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_export_invoices", x => x.id);
                    table.ForeignKey(
                        name: "fk_export_invoices_production_orders_production_order_id",
                        column: x => x.production_order_id,
                        principalTable: "production_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_chemical_export_details_export_invoice_id",
                table: "chemical_export_details",
                column: "export_invoice_id");

            migrationBuilder.CreateIndex(
                name: "ix_export_invoices_production_order_id",
                table: "export_invoices",
                column: "production_order_id");

            migrationBuilder.AddForeignKey(
                name: "fk_chemical_export_details_export_invoices_export_invoice_id",
                table: "chemical_export_details",
                column: "export_invoice_id",
                principalTable: "export_invoices",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_cut_glass_invoice_materials_export_invoices_export_invoice_id",
                table: "cut_glass_invoice_materials",
                column: "export_invoice_id",
                principalTable: "export_invoices",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
