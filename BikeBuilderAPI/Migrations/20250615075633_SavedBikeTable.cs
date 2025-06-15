using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BikeBuilderAPI.Migrations
{
    /// <inheritdoc />
    public partial class SavedBikeTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SavedBikes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    BikeType = table.Column<string>(type: "TEXT", nullable: false),
                    Frame = table.Column<string>(type: "TEXT", nullable: false),
                    Shock = table.Column<string>(type: "TEXT", nullable: false),
                    Fork = table.Column<string>(type: "TEXT", nullable: false),
                    Wheels = table.Column<string>(type: "TEXT", nullable: false),
                    Tyres = table.Column<string>(type: "TEXT", nullable: false),
                    Drivetrain = table.Column<string>(type: "TEXT", nullable: false),
                    Brakes = table.Column<string>(type: "TEXT", nullable: false),
                    Seatpost = table.Column<string>(type: "TEXT", nullable: false),
                    Saddle = table.Column<string>(type: "TEXT", nullable: false),
                    Bars = table.Column<string>(type: "TEXT", nullable: false),
                    Stem = table.Column<string>(type: "TEXT", nullable: false),
                    Pedals = table.Column<string>(type: "TEXT", nullable: false),
                    SavedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    AccountId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedBikes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SavedBikes_Accounts_AccountId",
                        column: x => x.AccountId,
                        principalTable: "Accounts",
                        principalColumn: "AccountId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SavedBikes_AccountId",
                table: "SavedBikes",
                column: "AccountId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SavedBikes");
        }
    }
}
