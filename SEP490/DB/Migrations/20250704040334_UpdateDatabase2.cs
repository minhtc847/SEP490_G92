using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateDatabase2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_employees_departments_department_id",
                table: "employees");

            migrationBuilder.DropTable(
                name: "departments");

            migrationBuilder.DropIndex(
                name: "ix_employees_department_id",
                table: "employees");

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "sale_orders",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "producing",
                table: "production_plan_details",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "da_giao",
                table: "production_plan_details",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "da_cat_kinh",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "da_tron_keo",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "delivery_histories",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "delivery_history_details",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    delivery_history_id = table.Column<int>(type: "int", nullable: false),
                    delivery_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    quantity_delivered = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_delivery_history_details", x => x.id);
                    table.ForeignKey(
                        name: "fk_delivery_history_details_delivery_histories_delivery_history",
                        column: x => x.delivery_history_id,
                        principalTable: "delivery_histories",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "export_invoices",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    employee_id = table.Column<int>(type: "int", nullable: true),
                    employee_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    export_date = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    note = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<int>(type: "int", nullable: true),
                    total_amount = table.Column<int>(type: "int", nullable: true),
                    production_order_id = table.Column<int>(type: "int", nullable: false)
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

            migrationBuilder.CreateTable(
                name: "glue_butyl_export_invoices",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_glue_butyl_export_invoices", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "chemical_export_details",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    export_invoice_id = table.Column<int>(type: "int", nullable: false),
                    product_id = table.Column<int>(type: "int", nullable: false),
                    quantity = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    uom = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_chemical_export_details", x => x.id);
                    table.ForeignKey(
                        name: "fk_chemical_export_details_export_invoices_export_invoice_id",
                        column: x => x.export_invoice_id,
                        principalTable: "export_invoices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "cut_glass_invoice_materials",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    export_invoice_id = table.Column<int>(type: "int", nullable: false),
                    material_name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    material_type = table.Column<int>(type: "int", nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cut_glass_invoice_materials", x => x.id);
                    table.ForeignKey(
                        name: "fk_cut_glass_invoice_materials_export_invoices_export_invoice_id",
                        column: x => x.export_invoice_id,
                        principalTable: "export_invoices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "cut_glass_invoice_outputs",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    cut_glass_invoice_material_id = table.Column<int>(type: "int", nullable: false),
                    output_name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    output_type = table.Column<int>(type: "int", nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    is_dc = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cut_glass_invoice_outputs", x => x.id);
                    table.ForeignKey(
                        name: "fk_cut_glass_invoice_outputs_cut_glass_invoice_materials_cut_gl",
                        column: x => x.cut_glass_invoice_material_id,
                        principalTable: "cut_glass_invoice_materials",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_chemical_export_details_export_invoice_id",
                table: "chemical_export_details",
                column: "export_invoice_id");

            migrationBuilder.CreateIndex(
                name: "ix_cut_glass_invoice_materials_export_invoice_id",
                table: "cut_glass_invoice_materials",
                column: "export_invoice_id");

            migrationBuilder.CreateIndex(
                name: "ix_cut_glass_invoice_outputs_cut_glass_invoice_material_id",
                table: "cut_glass_invoice_outputs",
                column: "cut_glass_invoice_material_id");

            migrationBuilder.CreateIndex(
                name: "ix_delivery_history_details_delivery_history_id",
                table: "delivery_history_details",
                column: "delivery_history_id");

            migrationBuilder.CreateIndex(
                name: "ix_export_invoices_production_order_id",
                table: "export_invoices",
                column: "production_order_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "chemical_export_details");

            migrationBuilder.DropTable(
                name: "cut_glass_invoice_outputs");

            migrationBuilder.DropTable(
                name: "delivery_history_details");

            migrationBuilder.DropTable(
                name: "glue_butyl_export_invoices");

            migrationBuilder.DropTable(
                name: "cut_glass_invoice_materials");

            migrationBuilder.DropTable(
                name: "export_invoices");

            migrationBuilder.DropColumn(
                name: "note",
                table: "sale_orders");

            migrationBuilder.DropColumn(
                name: "da_cat_kinh",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "da_tron_keo",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "note",
                table: "delivery_histories");

            migrationBuilder.AlterColumn<int>(
                name: "producing",
                table: "production_plan_details",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "da_giao",
                table: "production_plan_details",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "departments",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    department_name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_departments", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_employees_department_id",
                table: "employees",
                column: "department_id");

            migrationBuilder.AddForeignKey(
                name: "fk_employees_departments_department_id",
                table: "employees",
                column: "department_id",
                principalTable: "departments",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
