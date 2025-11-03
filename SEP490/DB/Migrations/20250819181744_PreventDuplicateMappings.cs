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
            
            // Unique index on (input_detail_id, output_detail_id) already exists
            // (defined in earlier migration/model snapshot as
            //  HasIndex("InputDetailId", "OutputDetailId").IsUnique().HasDatabaseName("ix_material_output_mappings_input_detail_id_output_detail_id")).
            // Do NOT attempt to recreate it here to avoid duplicate key name errors on MySQL.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Nothing to rollback for the index here because we did not create it in Up().
        }
    }
}
