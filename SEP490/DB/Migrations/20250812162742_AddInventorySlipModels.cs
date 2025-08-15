using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class AddInventorySlipModels : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "inventory_slips",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    slip_code = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    slip_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    transaction_type = table.Column<int>(type: "int", nullable: false),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    production_order_id = table.Column<int>(type: "int", nullable: false),
                    created_by = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_inventory_slips", x => x.id);
                    table.ForeignKey(
                        name: "fk_inventory_slips_employees_created_by_employee_id",
                        column: x => x.created_by,
                        principalTable: "employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_inventory_slips_production_orders_production_order_id",
                        column: x => x.production_order_id,
                        principalTable: "production_orders",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "inventory_slip_details",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    inventory_slip_id = table.Column<int>(type: "int", nullable: false),
                    product_id = table.Column<int>(type: "int", nullable: false),
                    production_output_id = table.Column<int>(type: "int", nullable: true),
                    quantity = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    note = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    sort_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_inventory_slip_details", x => x.id);
                    table.ForeignKey(
                        name: "fk_inventory_slip_details_inventory_slips_inventory_slip_id",
                        column: x => x.inventory_slip_id,
                        principalTable: "inventory_slips",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_inventory_slip_details_production_outputs_production_output_",
                        column: x => x.production_output_id,
                        principalTable: "production_outputs",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_inventory_slip_details_products_product_id",
                        column: x => x.product_id,
                        principalTable: "products",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "material_output_mappings",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    input_detail_id = table.Column<int>(type: "int", nullable: false),
                    output_detail_id = table.Column<int>(type: "int", nullable: false),
                    note = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_material_output_mappings", x => x.id);
                    table.ForeignKey(
                        name: "fk_material_output_mappings_inventory_slip_details_input_detail",
                        column: x => x.input_detail_id,
                        principalTable: "inventory_slip_details",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_material_output_mappings_inventory_slip_details_output_detai",
                        column: x => x.output_detail_id,
                        principalTable: "inventory_slip_details",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_slip_details_inventory_slip_id",
                table: "inventory_slip_details",
                column: "inventory_slip_id");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_slip_details_product_id",
                table: "inventory_slip_details",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_slip_details_production_output_id",
                table: "inventory_slip_details",
                column: "production_output_id");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_slips_created_by",
                table: "inventory_slips",
                column: "created_by");

            migrationBuilder.CreateIndex(
                name: "ix_inventory_slips_production_order_id",
                table: "inventory_slips",
                column: "production_order_id");

            migrationBuilder.CreateIndex(
                name: "ix_material_output_mappings_input_detail_id",
                table: "material_output_mappings",
                column: "input_detail_id");

            migrationBuilder.CreateIndex(
                name: "ix_material_output_mappings_output_detail_id",
                table: "material_output_mappings",
                column: "output_detail_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "material_output_mappings");

            migrationBuilder.DropTable(
                name: "inventory_slip_details");

            migrationBuilder.DropTable(
                name: "inventory_slips");
        }
    }
}
