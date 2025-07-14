using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateGlueButylExportTable2 : Migration
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
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "glue_butyl_export_invoices",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_glue_butyl_export_invoices_employee_id",
                table: "glue_butyl_export_invoices",
                column: "employee_id");

            migrationBuilder.AddForeignKey(
                name: "fk_glue_butyl_export_invoices_employees_employee_id",
                table: "glue_butyl_export_invoices",
                column: "employee_id",
                principalTable: "employees",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_glue_butyl_export_invoices_employees_employee_id",
                table: "glue_butyl_export_invoices");

            migrationBuilder.DropIndex(
                name: "ix_glue_butyl_export_invoices_employee_id",
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
        }
    }
}
