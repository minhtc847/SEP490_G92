using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class FixDataBaseKiet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_production_plans_customers_customer_id",
                table: "production_plans");

            migrationBuilder.DropForeignKey(
                name: "fk_production_plans_sale_orders_sale_order_id",
                table: "production_plans");

            migrationBuilder.DropColumn(
                name: "trang_thai_cat_kinh",
                table: "production_order_details");

            migrationBuilder.DropColumn(
                name: "trang_thai_xuat_keo",
                table: "production_order_details");

            migrationBuilder.AlterColumn<int>(
                name: "sale_order_id",
                table: "production_plans",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "customer_id",
                table: "production_plans",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "da_do_keo",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "da_ghep_kinh",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "do_dai_butyl",
                table: "production_plan_details",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "doday",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "is_kinh_cuong_luc",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "kinh4",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "kinh5",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "loai_butyl",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "so_lop_keo",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "so_lop_kinh",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "tong_keo_mem",
                table: "production_plan_details",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "tong_keo_nano",
                table: "production_plan_details",
                type: "decimal(65,30)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "uom",
                table: "production_plan_details",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "production_order_details",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "cut_glass_invoice_outputs",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "cut_glass_invoice_materials",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "chemical_export_details",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "fk_production_plans_customers_customer_id",
                table: "production_plans",
                column: "customer_id",
                principalTable: "customers",
                principalColumn: "id");

            migrationBuilder.AddForeignKey(
                name: "fk_production_plans_sale_orders_sale_order_id",
                table: "production_plans",
                column: "sale_order_id",
                principalTable: "sale_orders",
                principalColumn: "id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_production_plans_customers_customer_id",
                table: "production_plans");

            migrationBuilder.DropForeignKey(
                name: "fk_production_plans_sale_orders_sale_order_id",
                table: "production_plans");

            migrationBuilder.DropColumn(
                name: "da_do_keo",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "da_ghep_kinh",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "do_dai_butyl",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "doday",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "is_kinh_cuong_luc",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "kinh4",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "kinh5",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "loai_butyl",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "so_lop_keo",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "so_lop_kinh",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "tong_keo_mem",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "tong_keo_nano",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "uom",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "note",
                table: "cut_glass_invoice_outputs");

            migrationBuilder.DropColumn(
                name: "note",
                table: "cut_glass_invoice_materials");

            migrationBuilder.DropColumn(
                name: "note",
                table: "chemical_export_details");

            migrationBuilder.AlterColumn<int>(
                name: "sale_order_id",
                table: "production_plans",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "customer_id",
                table: "production_plans",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "production_order_details",
                keyColumn: "trang_thai",
                keyValue: null,
                column: "trang_thai",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "trang_thai",
                table: "production_order_details",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "trang_thai_cat_kinh",
                table: "production_order_details",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "trang_thai_xuat_keo",
                table: "production_order_details",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "fk_production_plans_customers_customer_id",
                table: "production_plans",
                column: "customer_id",
                principalTable: "customers",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_production_plans_sale_orders_sale_order_id",
                table: "production_plans",
                column: "sale_order_id",
                principalTable: "sale_orders",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
