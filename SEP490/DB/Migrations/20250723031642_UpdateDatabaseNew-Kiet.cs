using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateDatabaseNewKiet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_production_materials_products_product_id",
                table: "production_materials");

            migrationBuilder.DropTable(
                name: "history_messages");

            migrationBuilder.DropColumn(
                name: "customer_code",
                table: "sale_orders");

            migrationBuilder.DropColumn(
                name: "customer_code",
                table: "production_plans");

            migrationBuilder.DropColumn(
                name: "quantity",
                table: "production_plans");

            migrationBuilder.DropColumn(
                name: "da_cat_kinh",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "da_do_keo",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "da_ghep_kinh",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "da_tron_keo",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "producing",
                table: "production_plan_details");

            migrationBuilder.DropColumn(
                name: "broken_description",
                table: "production_outputs");

            migrationBuilder.DropColumn(
                name: "status",
                table: "production_outputs");

            migrationBuilder.DropColumn(
                name: "production_status",
                table: "production_orders");

            migrationBuilder.DropColumn(
                name: "status_da_lap_du_phieu_nhap",
                table: "production_orders");

            migrationBuilder.DropColumn(
                name: "status_da_lap_du_phieu_xuat",
                table: "production_orders");

            migrationBuilder.DropColumn(
                name: "status_da_nhap_kho_tp",
                table: "production_orders");

            migrationBuilder.DropColumn(
                name: "status_da_xuat_kho_nvl",
                table: "production_orders");

            migrationBuilder.DropColumn(
                name: "trang_thai",
                table: "production_order_details");

            migrationBuilder.DropColumn(
                name: "cost_item",
                table: "production_materials");

            migrationBuilder.DropColumn(
                name: "cost_object",
                table: "production_materials");

            migrationBuilder.DropColumn(
                name: "production_id",
                table: "production_materials");

            migrationBuilder.DropColumn(
                name: "production_name",
                table: "production_materials");

            migrationBuilder.DropColumn(
                name: "tag_name",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "zalo_id",
                table: "customers");

            migrationBuilder.DropColumn(
                name: "zalo_name",
                table: "customers");

            migrationBuilder.RenameColumn(
                name: "done",
                table: "production_outputs",
                newName: "finished");

            migrationBuilder.RenameColumn(
                name: "broken",
                table: "production_outputs",
                newName: "defected");

            migrationBuilder.AlterColumn<int>(
                name: "status",
                table: "sale_orders",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "delivery_status",
                table: "sale_orders",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "status",
                table: "purchase_orders",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "uom",
                table: "production_plan_details",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "uom",
                table: "production_outputs",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "production_orders",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "uom",
                table: "production_materials",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "product_id",
                table: "production_materials",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "partner_type",
                table: "customers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddForeignKey(
                name: "fk_production_materials_products_product_id",
                table: "production_materials",
                column: "product_id",
                principalTable: "products",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_production_materials_products_product_id",
                table: "production_materials");

            migrationBuilder.DropColumn(
                name: "status",
                table: "production_orders");

            migrationBuilder.DropColumn(
                name: "partner_type",
                table: "customers");

            migrationBuilder.RenameColumn(
                name: "finished",
                table: "production_outputs",
                newName: "done");

            migrationBuilder.RenameColumn(
                name: "defected",
                table: "production_outputs",
                newName: "broken");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "sale_orders",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "delivery_status",
                table: "sale_orders",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "customer_code",
                table: "sale_orders",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "status",
                table: "purchase_orders",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "customer_code",
                table: "production_plans",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "quantity",
                table: "production_plans",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "uom",
                table: "production_plan_details",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "da_cat_kinh",
                table: "production_plan_details",
                type: "int",
                nullable: true);

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

            migrationBuilder.AddColumn<int>(
                name: "da_tron_keo",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "producing",
                table: "production_plan_details",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "uom",
                table: "production_outputs",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "broken_description",
                table: "production_outputs",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "production_outputs",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "production_status",
                table: "production_orders",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "status_da_lap_du_phieu_nhap",
                table: "production_orders",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "status_da_lap_du_phieu_xuat",
                table: "production_orders",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "status_da_nhap_kho_tp",
                table: "production_orders",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "status_da_xuat_kho_nvl",
                table: "production_orders",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "trang_thai",
                table: "production_order_details",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<string>(
                name: "uom",
                table: "production_materials",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "product_id",
                table: "production_materials",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "cost_item",
                table: "production_materials",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "cost_object",
                table: "production_materials",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "production_id",
                table: "production_materials",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "production_name",
                table: "production_materials",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "tag_name",
                table: "customers",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "zalo_id",
                table: "customers",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "zalo_name",
                table: "customers",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "history_messages",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    content = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    conversation_id = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    media_url = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    message_type = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    order_id = table.Column<int>(type: "int", nullable: true),
                    processed = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    raw_data = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    received_time = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    send_time = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    sender_id = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    sender_type = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_history_messages", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "fk_production_materials_products_product_id",
                table: "production_materials",
                column: "product_id",
                principalTable: "products",
                principalColumn: "id");
        }
    }
}
