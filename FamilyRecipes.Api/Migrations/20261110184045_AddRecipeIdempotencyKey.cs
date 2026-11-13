using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyRecipes.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRecipeIdempotencyKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdempotencyKey",
                table: "Recipes",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "IdempotencyRequestHash",
                table: "Recipes",
                type: "varbinary(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Recipes_CreatedByUserId_IdempotencyKey",
                table: "Recipes",
                columns: new[] { "CreatedByUserId", "IdempotencyKey" },
                unique: true,
                filter: "[IdempotencyKey] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Recipes_CreatedByUserId_IdempotencyKey",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "IdempotencyKey",
                table: "Recipes");

            migrationBuilder.DropColumn(
                name: "IdempotencyRequestHash",
                table: "Recipes");
        }
    }
}
