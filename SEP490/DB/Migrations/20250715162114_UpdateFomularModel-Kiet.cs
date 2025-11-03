using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateFomularModelKiet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_formulars_glass_structures_glass_structure_id",
                table: "formulars");

            migrationBuilder.RenameColumn(
                name: "glass_structure_id",
                table: "formulars",
                newName: "product_id");

            migrationBuilder.RenameIndex(
                name: "ix_formulars_glass_structure_id",
                table: "formulars",
                newName: "ix_formulars_product_id");

            migrationBuilder.AddForeignKey(
                name: "fk_formulars_products_product_id",
                table: "formulars",
                column: "product_id",
                principalTable: "products",
                principalColumn: "id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "fk_formulars_products_product_id",
                table: "formulars");

            migrationBuilder.RenameColumn(
                name: "product_id",
                table: "formulars",
                newName: "glass_structure_id");

            migrationBuilder.RenameIndex(
                name: "ix_formulars_product_id",
                table: "formulars",
                newName: "ix_formulars_glass_structure_id");

            migrationBuilder.AddForeignKey(
                name: "fk_formulars_glass_structures_glass_structure_id",
                table: "formulars",
                column: "glass_structure_id",
                principalTable: "glass_structures",
                principalColumn: "id");
        }
    }
}
