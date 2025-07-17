using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class AddMaterialChatTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "export_invoice_id",
                table: "chemical_export_details");

            migrationBuilder.AlterColumn<int>(
                name: "product_id",
                table: "chemical_export_details",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "production_order_id",
                table: "chemical_export_details",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "materials",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    content = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    file_path = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    chunk_count = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_materials", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_chemical_export_details_product_id",
                table: "chemical_export_details",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_chemical_export_details_production_order_id",
                table: "chemical_export_details",
                column: "production_order_id");

            migrationBuilder.AddForeignKey(
                name: "fk_chemical_export_details_production_orders_production_order_id",
                table: "chemical_export_details",
                column: "production_order_id",
                principalTable: "production_orders",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_chemical_export_details_products_product_id",
                table: "chemical_export_details",
                column: "product_id",
                principalTable: "products",
                principalColumn: "id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_chemical_export_details_production_orders_production_order_id",
                table: "chemical_export_details");

            migrationBuilder.DropForeignKey(
                name: "fk_chemical_export_details_products_product_id",
                table: "chemical_export_details");

            migrationBuilder.DropTable(
                name: "materials");

            migrationBuilder.DropIndex(
                name: "ix_chemical_export_details_product_id",
                table: "chemical_export_details");

            migrationBuilder.DropIndex(
                name: "ix_chemical_export_details_production_order_id",
                table: "chemical_export_details");

            migrationBuilder.DropColumn(
                name: "production_order_id",
                table: "chemical_export_details");

            migrationBuilder.AlterColumn<int>(
                name: "product_id",
                table: "chemical_export_details",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "export_invoice_id",
                table: "chemical_export_details",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
