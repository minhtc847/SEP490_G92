using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class InitDatabase : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "customers",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    customer_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    customer_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    address = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    debt = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    tax_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    contact_person = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    phone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    discount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    is_supplier = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_customers", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "glass_structures",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    product_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    category = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    edge_type = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    adhesive_type = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    glass_layers = table.Column<int>(type: "int", nullable: false),
                    adhesive_layers = table.Column<int>(type: "int", nullable: false),
                    adhesive_thickness = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    composition = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_glass_structures", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "purchase_orders",
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
                    table.PrimaryKey("pk_purchase_orders", x => x.id);
                    table.ForeignKey(
                        name: "fk_purchase_orders_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "products",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    product_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    product_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    product_type = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    category = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    length = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    width = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    thickness = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    weight = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    unit_price = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    glass_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    glass_structure_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_products", x => x.id);
                    table.ForeignKey(
                        name: "fk_products_glass_structures_glass_structure_id",
                        column: x => x.glass_structure_id,
                        principalTable: "glass_structures",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "deliveries",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    order_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    purchase_order_id = table.Column<int>(type: "int", nullable: false),
                    customer_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    order_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    address = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    total_value = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    quantity_to_deliver = table.Column<int>(type: "int", nullable: false),
                    quantity_delivered = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_deliveries", x => x.id);
                    table.ForeignKey(
                        name: "fk_deliveries_purchase_orders_purchase_order_id",
                        column: x => x.purchase_order_id,
                        principalTable: "purchase_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "order_details",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    order_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    purchase_order_id = table.Column<int>(type: "int", nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    unit_price = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    total_amount = table.Column<decimal>(type: "decimal(65,30)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_order_details", x => x.id);
                    table.ForeignKey(
                        name: "fk_order_details_purchase_orders_purchase_order_id",
                        column: x => x.purchase_order_id,
                        principalTable: "purchase_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "production_plans",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    plan_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    order_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    purchase_order_id = table.Column<int>(type: "int", nullable: false),
                    customer_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    customer_id = table.Column<int>(type: "int", nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_production_plans", x => x.id);
                    table.ForeignKey(
                        name: "fk_production_plans_customers_customer_id",
                        column: x => x.customer_id,
                        principalTable: "customers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_production_plans_purchase_orders_purchase_order_id",
                        column: x => x.purchase_order_id,
                        principalTable: "purchase_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "delivery_details",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    delivery_id = table.Column<int>(type: "int", nullable: false),
                    delivery_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    product_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    product_id = table.Column<int>(type: "int", nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    height = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    width = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    thickness = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    unit_price = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    total_amount = table.Column<decimal>(type: "decimal(65,30)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_delivery_details", x => x.id);
                    table.ForeignKey(
                        name: "fk_delivery_details_deliveries_delivery_id",
                        column: x => x.delivery_id,
                        principalTable: "deliveries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_delivery_details_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "order_detail_products",
                columns: table => new
                {
                    order_detail_id = table.Column<int>(type: "int", nullable: false),
                    product_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_order_detail_products", x => new { x.order_detail_id, x.product_id });
                    table.ForeignKey(
                        name: "fk_order_detail_products_order_details_order_detail_id",
                        column: x => x.order_detail_id,
                        principalTable: "order_details",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_order_detail_products_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "production_orders",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    production_order_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    order_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    receipt_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    issue_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    production_plan_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    production_plan_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_production_orders", x => x.id);
                    table.ForeignKey(
                        name: "fk_production_orders_production_plans_production_plan_id",
                        column: x => x.production_plan_id,
                        principalTable: "production_plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "warehouse_issues",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    document_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    accounting_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    document_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    total_amount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    receiver = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    issue_reason = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    production_order_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    production_order_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_warehouse_issues", x => x.id);
                    table.ForeignKey(
                        name: "fk_warehouse_issues_production_orders_production_order_id",
                        column: x => x.production_order_id,
                        principalTable: "production_orders",
                        principalColumn: "id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "warehouse_receipts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    document_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    accounting_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    total_amount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    deliverer = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    production_order_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    production_order_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_warehouse_receipts", x => x.id);
                    table.ForeignKey(
                        name: "fk_warehouse_receipts_production_orders_production_order_id",
                        column: x => x.production_order_id,
                        principalTable: "production_orders",
                        principalColumn: "id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "inventory_transactions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    product_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    product_id = table.Column<int>(type: "int", nullable: false),
                    product_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    warehouse = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    unit = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    unit_price = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    total_amount = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    production_order_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    production_order_id = table.Column<int>(type: "int", nullable: true),
                    cost_object = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    document_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    warehouse_receipt_id = table.Column<int>(type: "int", nullable: true),
                    warehouse_issue_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_inventory_transactions", x => x.id);
                    table.ForeignKey(
                        name: "fk_inventory_transactions_production_orders_production_order_id",
                        column: x => x.production_order_id,
                        principalTable: "production_orders",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_inventory_transactions_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_inventory_transactions_warehouse_issues_warehouse_issue_id",
                        column: x => x.warehouse_issue_id,
                        principalTable: "warehouse_issues",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "fk_inventory_transactions_warehouse_receipts_warehouse_receipt_",
                        column: x => x.warehouse_receipt_id,
                        principalTable: "warehouse_receipts",
                        principalColumn: "id");
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_deliveries_purchase_order_id",
                table: "deliveries",
                column: "purchase_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_delivery_details_delivery_id",
                table: "delivery_details",
                column: "delivery_id");

            migrationBuilder.CreateIndex(
                name: "ix_delivery_details_product_id",
                table: "delivery_details",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_transactions_product_id",
                table: "inventory_transactions",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_transactions_production_order_id",
                table: "inventory_transactions",
                column: "production_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_transactions_warehouse_issue_id",
                table: "inventory_transactions",
                column: "warehouse_issue_id");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_transactions_warehouse_receipt_id",
                table: "inventory_transactions",
                column: "warehouse_receipt_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_detail_products_product_id",
                table: "order_detail_products",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_order_details_purchase_order_id",
                table: "order_details",
                column: "purchase_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_orders_production_plan_id",
                table: "production_orders",
                column: "production_plan_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_plans_customer_id",
                table: "production_plans",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "ix_production_plans_purchase_order_id",
                table: "production_plans",
                column: "purchase_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_products_glass_structure_id",
                table: "products",
                column: "glass_structure_id");

            migrationBuilder.CreateIndex(
                name: "ix_purchase_orders_customer_id",
                table: "purchase_orders",
                column: "customer_id");

            migrationBuilder.CreateIndex(
                name: "ix_warehouse_issues_production_order_id",
                table: "warehouse_issues",
                column: "production_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_warehouse_receipts_production_order_id",
                table: "warehouse_receipts",
                column: "production_order_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "delivery_details");

            migrationBuilder.DropTable(
                name: "inventory_transactions");

            migrationBuilder.DropTable(
                name: "order_detail_products");

            migrationBuilder.DropTable(
                name: "deliveries");

            migrationBuilder.DropTable(
                name: "warehouse_issues");

            migrationBuilder.DropTable(
                name: "warehouse_receipts");

            migrationBuilder.DropTable(
                name: "order_details");

            migrationBuilder.DropTable(
                name: "products");

            migrationBuilder.DropTable(
                name: "production_orders");

            migrationBuilder.DropTable(
                name: "glass_structures");

            migrationBuilder.DropTable(
                name: "production_plans");

            migrationBuilder.DropTable(
                name: "purchase_orders");

            migrationBuilder.DropTable(
                name: "customers");
        }
    }
}
