using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateGlueButylExportTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "glue_butyl_export_invoices",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "employee_id",
                table: "glue_butyl_export_invoices",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "glue_butyl_export_invoices",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "production_order_id",
                table: "glue_butyl_export_invoices",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "products",
                table: "glue_butyl_export_invoices",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_glue_butyl_export_invoices_employee_id",
                table: "glue_butyl_export_invoices",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "ix_glue_butyl_export_invoices_production_order_id",
                table: "glue_butyl_export_invoices",
                column: "production_order_id");

            migrationBuilder.AddForeignKey(
                name: "fk_glue_butyl_export_invoices_employees_employee_id",
                table: "glue_butyl_export_invoices",
                column: "employee_id",
                principalTable: "employees",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_glue_butyl_export_invoices_production_orders_production_orde",
                table: "glue_butyl_export_invoices",
                column: "production_order_id",
                principalTable: "production_orders",
                principalColumn: "id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_glue_butyl_export_invoices_employees_employee_id",
                table: "glue_butyl_export_invoices");

            migrationBuilder.DropForeignKey(
                name: "fk_glue_butyl_export_invoices_production_orders_production_orde",
                table: "glue_butyl_export_invoices");

            migrationBuilder.DropIndex(
                name: "ix_glue_butyl_export_invoices_employee_id",
                table: "glue_butyl_export_invoices");

            migrationBuilder.DropIndex(
                name: "ix_glue_butyl_export_invoices_production_order_id",
                table: "glue_butyl_export_invoices");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "glue_butyl_export_invoices");

            migrationBuilder.DropColumn(
                name: "employee_id",
                table: "glue_butyl_export_invoices");

            migrationBuilder.DropColumn(
                name: "note",
                table: "glue_butyl_export_invoices");

            migrationBuilder.DropColumn(
                name: "production_order_id",
                table: "glue_butyl_export_invoices");

            migrationBuilder.DropColumn(
                name: "products",
                table: "glue_butyl_export_invoices");
        }
    }
}
