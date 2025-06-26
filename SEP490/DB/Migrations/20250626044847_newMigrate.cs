using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class newMigrate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_products_glass_structures_glass_structure_id",
                table: "products");

            migrationBuilder.AlterColumn<int>(
                name: "glass_structure_id",
                table: "products",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<string>(
                name: "product_code",
                table: "glass_structures",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddForeignKey(
                name: "fk_products_glass_structures_glass_structure_id",
                table: "products",
                column: "glass_structure_id",
                principalTable: "glass_structures",
                principalColumn: "id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_products_glass_structures_glass_structure_id",
                table: "products");

            migrationBuilder.DropColumn(
                name: "product_code",
                table: "glass_structures");

            migrationBuilder.AlterColumn<int>(
                name: "glass_structure_id",
                table: "products",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "fk_products_glass_structures_glass_structure_id",
                table: "products",
                column: "glass_structure_id",
                principalTable: "glass_structures",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
