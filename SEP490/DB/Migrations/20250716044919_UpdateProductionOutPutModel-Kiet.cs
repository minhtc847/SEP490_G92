using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateProductionOutPutModelKiet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "chemical_name",
                table: "formulars");

            migrationBuilder.RenameColumn(
                name: "cost_object",
                table: "production_outputs",
                newName: "status");

            migrationBuilder.AddColumn<int>(
                name: "broken",
                table: "production_outputs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "broken_description",
                table: "production_outputs",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<int>(
                name: "done",
                table: "production_outputs",
                type: "int",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "broken",
                table: "production_outputs");

            migrationBuilder.DropColumn(
                name: "broken_description",
                table: "production_outputs");

            migrationBuilder.DropColumn(
                name: "done",
                table: "production_outputs");

            migrationBuilder.RenameColumn(
                name: "status",
                table: "production_outputs",
                newName: "cost_object");

            migrationBuilder.AddColumn<string>(
                name: "chemical_name",
                table: "formulars",
                type: "longtext",
                nullable: false)
                .Annotation("MySql:CharSet", "utf8mb4");
        }
    }
}
