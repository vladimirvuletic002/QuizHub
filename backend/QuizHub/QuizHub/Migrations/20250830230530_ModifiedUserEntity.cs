using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizHub.Migrations
{
    /// <inheritdoc />
    public partial class ModifiedUserEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProfileImageContentType",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProfileImageContentType",
                table: "Users");
        }
    }
}
