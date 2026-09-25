using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FamilyRecipes.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddExternalTenantIdToUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_ExternalUserId",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "ExternalUserId",
                table: "Users",
                type: "nvarchar(36)",
                maxLength: 36,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AddColumn<string>(
                name: "ExternalTenantId",
                table: "Users",
                type: "nvarchar(36)",
                maxLength: 36,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE [Users]
                SET [ExternalTenantId] = 'development'
                WHERE [ExternalTenantId] IS NULL
                """);

            migrationBuilder.AlterColumn<string>(
                name: "ExternalTenantId",
                table: "Users",
                type: "nvarchar(36)",
                maxLength: 36,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(36)",
                oldMaxLength: 36,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ExternalTenantId_ExternalUserId",
                table: "Users",
                columns: new[] { "ExternalTenantId", "ExternalUserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_ExternalTenantId_ExternalUserId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ExternalTenantId",
                table: "Users");

            migrationBuilder.AlterColumn<string>(
                name: "ExternalUserId",
                table: "Users",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(36)",
                oldMaxLength: 36);

            migrationBuilder.CreateIndex(
                name: "IX_Users_ExternalUserId",
                table: "Users",
                column: "ExternalUserId",
                unique: true);
        }
    }
}
