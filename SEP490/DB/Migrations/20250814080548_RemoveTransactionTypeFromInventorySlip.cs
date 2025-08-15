using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SEP490.DB.Migrations
{
    public partial class RemoveTransactionTypeFromInventorySlip : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "transaction_type",
                table: "inventory_slips");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "transaction_type",
                table: "inventory_slips",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}
