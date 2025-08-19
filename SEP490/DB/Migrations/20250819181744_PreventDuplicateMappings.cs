using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class PreventDuplicateMappings : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // First, remove any existing duplicate mappings
            migrationBuilder.Sql(@"
                DELETE m1 FROM material_output_mappings m1
                INNER JOIN material_output_mappings m2 
                WHERE m1.id > m2.id 
                AND m1.input_detail_id = m2.input_detail_id 
                AND m1.output_detail_id = m2.output_detail_id
            ");

            // Add unique constraint to prevent duplicate mappings
            migrationBuilder.CreateIndex(
                name: "IX_material_output_mappings_input_detail_id_output_detail_id",
                table: "material_output_mappings",
                columns: new[] { "input_detail_id", "output_detail_id" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove the unique constraint
            migrationBuilder.DropIndex(
                name: "IX_material_output_mappings_input_detail_id_output_detail_id",
                table: "material_output_mappings");
        }
    }
}
