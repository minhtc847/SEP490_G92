using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateDatabase : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_deliveries_purchase_orders_purchase_order_id",
                table: "deliveries");

            migrationBuilder.DropForeignKey(
                name: "fk_order_details_purchase_orders_purchase_order_id",
                table: "order_details");

            migrationBuilder.DropForeignKey(
                name: "fk_production_plans_purchase_orders_purchase_order_id",
                table: "production_plans");

            migrationBuilder.DropTable(
                name: "purchase_orders");

            migrationBuilder.DropColumn(
                name: "category",
                table: "products");

            migrationBuilder.DropColumn(
                name: "issue_code",
                table: "production_orders");

            migrationBuilder.DropColumn(
                name: "receipt_code",
                table: "production_orders");

            migrationBuilder.RenameColumn(
                name: "length",
                table: "products",
                newName: "uom");

            migrationBuilder.RenameColumn(
                name: "glass_code",
                table: "products",
                newName: "height");

            migrationBuilder.RenameColumn(
                name: "purchase_order_id",
                table: "production_plans",
                newName: "sale_order_id");

            migrationBuilder.RenameIndex(
                name: "ix_production_plans_purchase_order_id",
                table: "production_plans",
                newName: "ix_production_plans_sale_order_id");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "production_orders",
                newName: "production_status");

            migrationBuilder.RenameColumn(
                name: "purchase_order_id",
                table: "order_details",
                newName: "sale_order_id");

            migrationBuilder.RenameIndex(
                name: "ix_order_details_purchase_order_id",
                table: "order_details",
                newName: "ix_order_details_sale_order_id");

            migrationBuilder.RenameColumn(
                name: "unit",
                table: "inventory_transactions",
                newName: "uom");

            migrationBuilder.RenameColumn(
                name: "document_code",
                table: "inventory_transactions",
                newName: "code_item");

            migrationBuilder.RenameColumn(
                name: "purchase_order_id",
                table: "deliveries",
                newName: "sale_order_id");

            migrationBuilder.RenameIndex(
                name: "ix_deliveries_purchase_order_id",
                table: "deliveries",
                newName: "ix_deliveries_sale_order_id");

            migrationBuilder.AlterColumn<int>(
                name: "quantity",
                table: "production_plans",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "quantity",
                table: "order_details",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "quantity",
                table: "inventory_transactions",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "glass_layers",
                table: "glass_structures",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<decimal>(
                name: "adhesive_thickness",
                table: "glass_structures",
                type: "decimal(65,30)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)");

            migrationBuilder.AlterColumn<int>(
                name: "adhesive_layers",
                table: "glass_structures",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "unit_price",
                table: "glass_structures",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "quantity",
                table: "delivery_details",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "quantity_to_deliver",
                table: "deliveries",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "quantity_delivered",
                table: "deliveries",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateTable(
                name: "production_outputs",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    product_id = table.Column<int>(type: "int", nullable: false),
                    product_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    uom = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    amount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    order_id = table.Column<int>(type: "int", nullable: false),
                    cost_object = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    production_order_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_production_outputs", x => x.id);
                    table.ForeignKey(
                        name: "fk_production_outputs_production_orders_production_order_id",
                        column: x => x.production_order_id,
                        principalTable: "production_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_production_outputs_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "sale_orders",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    order_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    order_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    customer_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    customer_id = table.Column<int>(type: "int", nullable: false),
                    order_value = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    status = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    delivery_status = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sale_orders", x => x.id);
                    table.ForeignKey(
                        name: "fk_sale_orders_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "production_materials",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    production_id = table.Column<int>(type: "int", nullable: false),
                    production_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    production_output_id = table.Column<int>(type: "int", nullable: false),
                    uom = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    amount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    cost_object = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    cost_item = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    product_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_production_materials", x => x.id);
                    table.ForeignKey(
                        name: "fk_production_materials_production_outputs_production_output_id",
                        column: x => x.production_output_id,
                        principalTable: "production_outputs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_production_materials_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_production_materials_product_id",
                table: "production_materials",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_materials_production_output_id",
                table: "production_materials",
                column: "production_output_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_outputs_product_id",
                table: "production_outputs",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_outputs_production_order_id",
                table: "production_outputs",
                column: "production_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_sale_orders_customer_id",
                table: "sale_orders",
                column: "customer_id");

            migrationBuilder.AddForeignKey(
                name: "fk_deliveries_sale_orders_sale_order_id",
                table: "deliveries",
                column: "sale_order_id",
                principalTable: "sale_orders",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_order_details_sale_orders_sale_order_id",
                table: "order_details",
                column: "sale_order_id",
                principalTable: "sale_orders",
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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_deliveries_sale_orders_sale_order_id",
                table: "deliveries");

            migrationBuilder.DropForeignKey(
                name: "fk_order_details_sale_orders_sale_order_id",
                table: "order_details");

            migrationBuilder.DropForeignKey(
                name: "fk_production_plans_sale_orders_sale_order_id",
                table: "production_plans");

            migrationBuilder.DropTable(
                name: "production_materials");

            migrationBuilder.DropTable(
                name: "sale_orders");

            migrationBuilder.DropTable(
                name: "production_outputs");

            migrationBuilder.DropColumn(
                name: "unit_price",
                table: "glass_structures");

            migrationBuilder.RenameColumn(
                name: "uom",
                table: "products",
                newName: "length");

            migrationBuilder.RenameColumn(
                name: "height",
                table: "products",
                newName: "glass_code");

            migrationBuilder.RenameColumn(
                name: "sale_order_id",
                table: "production_plans",
                newName: "purchase_order_id");

            migrationBuilder.RenameIndex(
                name: "ix_production_plans_sale_order_id",
                table: "production_plans",
                newName: "ix_production_plans_purchase_order_id");

            migrationBuilder.RenameColumn(
                name: "production_status",
                table: "production_orders",
                newName: "status");

            migrationBuilder.RenameColumn(
                name: "sale_order_id",
                table: "order_details",
                newName: "purchase_order_id");

            migrationBuilder.RenameIndex(
                name: "ix_order_details_sale_order_id",
                table: "order_details",
                newName: "ix_order_details_purchase_order_id");

            migrationBuilder.RenameColumn(
                name: "uom",
                table: "inventory_transactions",
                newName: "unit");

            migrationBuilder.RenameColumn(
                name: "code_item",
                table: "inventory_transactions",
                newName: "document_code");

            migrationBuilder.RenameColumn(
                name: "sale_order_id",
                table: "deliveries",
                newName: "purchase_order_id");

            migrationBuilder.RenameIndex(
                name: "ix_deliveries_sale_order_id",
                table: "deliveries",
                newName: "ix_deliveries_purchase_order_id");

            migrationBuilder.AddColumn<string>(
                name: "category",
                table: "products",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "quantity",
                table: "production_plans",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "issue_code",
                table: "production_orders",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "receipt_code",
                table: "production_orders",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AlterColumn<int>(
                name: "quantity",
                table: "order_details",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "quantity",
                table: "inventory_transactions",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "glass_layers",
                table: "glass_structures",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "adhesive_thickness",
                table: "glass_structures",
                type: "decimal(65,30)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(65,30)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "adhesive_layers",
                table: "glass_structures",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "quantity",
                table: "delivery_details",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "quantity_to_deliver",
                table: "deliveries",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "quantity_delivered",
                table: "deliveries",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "purchase_orders",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    customer_id = table.Column<int>(type: "int", nullable: false),
                    customer_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    delivery_status = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    order_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    order_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    order_value = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    status = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_purchase_orders", x => x.id);
                    table.ForeignKey(
                        name: "fk_purchase_orders_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_orders_customer_id",
                table: "purchase_orders",
                column: "customer_id");

            migrationBuilder.AddForeignKey(
                name: "fk_deliveries_purchase_orders_purchase_order_id",
                table: "deliveries",
                column: "purchase_order_id",
                principalTable: "purchase_orders",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_order_details_purchase_orders_purchase_order_id",
                table: "order_details",
                column: "purchase_order_id",
                principalTable: "purchase_orders",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_production_plans_purchase_orders_purchase_order_id",
                table: "production_plans",
                column: "purchase_order_id",
                principalTable: "purchase_orders",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
