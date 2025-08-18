using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class UpdateConvesationStateKiet : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "last_llm_response_json",
                table: "zalo_conversation_states",
                type: "varchar(4000)",
                maxLength: 4000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "last_llm_response_json",
                table: "zalo_conversation_states");
        }
    }
}
