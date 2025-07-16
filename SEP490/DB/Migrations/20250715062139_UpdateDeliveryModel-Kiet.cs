using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateDeliveryModelKiet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_delivery_histories_production_plans_production_plan_id",
                table: "delivery_histories");

            migrationBuilder.DropForeignKey(
                name: "fk_delivery_histories_products_product_id",
                table: "delivery_histories");

            migrationBuilder.DropTable(
                name: "delivery_history_details");

            migrationBuilder.DropIndex(
                name: "ix_delivery_histories_product_id",
                table: "delivery_histories");

            migrationBuilder.DropColumn(
                name: "product_id",
                table: "delivery_histories");

            migrationBuilder.RenameColumn(
                name: "quantity_delivery",
                table: "delivery_histories",
                newName: "quantity_delivered");

            migrationBuilder.RenameColumn(
                name: "production_plan_id",
                table: "delivery_histories",
                newName: "production_plan_detail_id");

            migrationBuilder.RenameIndex(
                name: "ix_delivery_histories_production_plan_id",
                table: "delivery_histories",
                newName: "ix_delivery_histories_production_plan_detail_id");

            migrationBuilder.AddForeignKey(
                name: "fk_delivery_histories_production_plan_details_production_plan_d",
                table: "delivery_histories",
                column: "production_plan_detail_id",
                principalTable: "production_plan_details",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_delivery_histories_production_plan_details_production_plan_d",
                table: "delivery_histories");

            migrationBuilder.RenameColumn(
                name: "quantity_delivered",
                table: "delivery_histories",
                newName: "quantity_delivery");

            migrationBuilder.RenameColumn(
                name: "production_plan_detail_id",
                table: "delivery_histories",
                newName: "production_plan_id");

            migrationBuilder.RenameIndex(
                name: "ix_delivery_histories_production_plan_detail_id",
                table: "delivery_histories",
                newName: "ix_delivery_histories_production_plan_id");

            migrationBuilder.AddColumn<int>(
                name: "product_id",
                table: "delivery_histories",
                type: "int",
                nullable: false,
                defaultValue: 0);

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

            migrationBuilder.CreateIndex(
                name: "ix_delivery_histories_product_id",
                table: "delivery_histories",
                column: "product_id");

            migrationBuilder.CreateIndex(
                name: "ix_delivery_history_details_delivery_history_id",
                table: "delivery_history_details",
                column: "delivery_history_id");

            migrationBuilder.AddForeignKey(
                name: "fk_delivery_histories_production_plans_production_plan_id",
                table: "delivery_histories",
                column: "production_plan_id",
                principalTable: "production_plans",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "fk_delivery_histories_products_product_id",
                table: "delivery_histories",
                column: "product_id",
                principalTable: "products",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
