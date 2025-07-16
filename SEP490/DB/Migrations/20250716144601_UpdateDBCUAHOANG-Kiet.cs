using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateDBCUAHOANGKiet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_production_outputs_production_orders_production_order_id",
                table: "production_outputs");

            migrationBuilder.AlterColumn<int>(
                name: "production_order_id",
                table: "production_outputs",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "cut_glass_invoice_outputs",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "cut_glass_invoice_outputs",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "cut_glass_invoice_materials",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "cut_glass_invoice_materials",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddForeignKey(
                name: "fk_production_outputs_production_orders_production_order_id",
                table: "production_outputs",
                column: "production_order_id",
                principalTable: "production_orders",
                principalColumn: "id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_production_outputs_production_orders_production_order_id",
                table: "production_outputs");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "cut_glass_invoice_outputs");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "cut_glass_invoice_outputs");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "cut_glass_invoice_materials");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "cut_glass_invoice_materials");

            migrationBuilder.AlterColumn<int>(
                name: "production_order_id",
                table: "production_outputs",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "fk_production_outputs_production_orders_production_order_id",
                table: "production_outputs",
                column: "production_order_id",
                principalTable: "production_orders",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
