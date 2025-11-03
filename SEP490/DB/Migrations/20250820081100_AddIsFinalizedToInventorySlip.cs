using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class AddIsFinalizedToInventorySlip : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_finalized",
                table: "inventory_slips",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
            // Note: We no longer drop or create indexes here to avoid conflicts
            // with existing foreign keys and previously-created unique indexes.
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_finalized",
                table: "inventory_slips");
            // No index changes in Down() either, to keep schema consistent across environments
        }
    }
}
