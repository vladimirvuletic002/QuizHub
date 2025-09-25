using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QuizHub.Migrations
{
    /// <inheritdoc />
    public partial class AddedLeaderboards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "QuizLeaderboards",
                columns: table => new
                {
                    QuizId = table.Column<long>(type: "bigint", nullable: false),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    Score = table.Column<int>(type: "int", nullable: false),
                    MaxScore = table.Column<int>(type: "int", nullable: false),
                    DurationSeconds = table.Column<int>(type: "int", nullable: true),
                    AttemptId = table.Column<long>(type: "bigint", nullable: true),
                    CompletedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizLeaderboards", x => new { x.QuizId, x.UserId });
                    table.ForeignKey(
                        name: "FK_QuizLeaderboards_Quizzes_QuizId",
                        column: x => x.QuizId,
                        principalTable: "Quizzes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuizLeaderboards_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_QuizLeaderboards_QuizId_Score_DurationSeconds_CompletedAtUtc",
                table: "QuizLeaderboards",
                columns: new[] { "QuizId", "Score", "DurationSeconds", "CompletedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_QuizLeaderboards_UserId",
                table: "QuizLeaderboards",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QuizLeaderboards");
        }
    }
}
