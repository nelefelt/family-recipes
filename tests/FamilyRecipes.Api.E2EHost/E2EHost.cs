using FamilyRecipes.Api.Data;
using Microsoft.EntityFrameworkCore;
using Testcontainers.MsSql;

namespace FamilyRecipes.Api.E2EHost;

// Started by Playwright. Not named Program, because the API already has a public class with that name.
internal static class E2EHost
{
    private const int Port = 5199;

    private static async Task Main()
    {
        // Ryuk, the Testcontainers cleanup container, removes the database when this process exits.
        var database = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-CU27-ubuntu-22.04")
            .WithDatabase("FamilyRecipesE2E")
            .Build();

        await database.StartAsync();

        var connectionString = database.GetConnectionString();

        // Runs before the server starts, so /health cannot answer until the tables exist.
        await MigrateAsync(connectionString);

        var factory = new E2EApiFactory(connectionString);
        factory.UseKestrel(Port);
        factory.StartServer();

        Console.WriteLine($"E2E API is listening on http://localhost:{Port}");

        // Playwright stops this process when the test run is over.
        await Task.Delay(Timeout.Infinite);
    }

    private static async Task MigrateAsync(string connectionString)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        await using var dbContext = new AppDbContext(options);
        await dbContext.Database.MigrateAsync();
    }
}
