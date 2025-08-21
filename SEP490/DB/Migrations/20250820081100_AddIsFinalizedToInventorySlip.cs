using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class AddIsFinalizedToInventorySlip : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_material_output_mappings_input_detail_id",
                table: "material_output_mappings");

            migrationBuilder.AddColumn<bool>(
                name: "is_finalized",
                table: "inventory_slips",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "ix_material_output_mappings_input_detail_id_output_detail_id",
                table: "material_output_mappings",
                columns: new[] { "input_detail_id", "output_detail_id" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_material_output_mappings_input_detail_id_output_detail_id",
                table: "material_output_mappings");

            migrationBuilder.DropColumn(
                name: "is_finalized",
                table: "inventory_slips");

            migrationBuilder.CreateIndex(
                name: "ix_material_output_mappings_input_detail_id",
                table: "material_output_mappings",
                column: "input_detail_id");
        }
    }
}
