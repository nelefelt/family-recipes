using System.Data.Common;
using FamilyRecipes.Api.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Respawn;
using Respawn.Graph;
using Testcontainers.MsSql;

namespace FamilyRecipes.Api.IntegrationTests.Infrastructure;

// Starts the API once against a temporary SQL Server in Docker, with TestAuthHandler instead of Entra.
// ResetDatabaseAsync clears data between tests and keeps the schema and migration history.
public sealed class FamilyRecipesApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private const string DatabaseName = "FamilyRecipesTests";

    private readonly MsSqlContainer _database = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-CU27-ubuntu-22.04")
        .WithDatabase(DatabaseName)
        .Build();

    private Respawner _respawner = null!;

    // Starts SQL Server, applies migrations, and prepares Respawn. Runs once for the whole test collection.
    public async ValueTask InitializeAsync()
    {
        await _database.StartAsync();

        using var scope = Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await dbContext.Database.MigrateAsync();

        await using var connection = await OpenConnectionAsync();
        _respawner = await Respawner.CreateAsync(
            connection,
            new RespawnerOptions
            {
                TablesToIgnore = [new Table(null, "__EFMigrationsHistory")]
            });
    }

    // Returns a client signed in as the given user. Pass scope: null to leave out the required scope (403).
    public HttpClient CreateAuthenticatedClient(string externalId, string name, string? scope = "access_as_user")
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, externalId);
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserNameHeader, name);

        if (scope is not null)
        {
            client.DefaultRequestHeaders.Add(TestAuthHandler.ScopeHeader, scope);
        }

        return client;
    }

    // Deletes all rows and keeps the schema and migration history, so the next test starts empty.
    public async Task ResetDatabaseAsync()
    {
        await using var connection = await OpenConnectionAsync();
        await _respawner.ResetAsync(connection);
    }

    // Opens the connection Respawn resets. Respawn 7 needs an open DbConnection, not a connection string.
    private async Task<DbConnection> OpenConnectionAsync()
    {
        var connection = new SqlConnection(_database.GetConnectionString());
        await connection.OpenAsync();
        return connection;
    }

    // Stops the test server, then removes the container even if that shutdown fails.
    public override async ValueTask DisposeAsync()
    {
        try
        {
            await base.DisposeAsync();
        }
        finally
        {
            await _database.DisposeAsync();
        }
    }

    // Points the API at the test database and replaces Entra with TestAuthHandler. Testing skips secrets and Swagger.
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        var connectionString = _database.GetConnectionString();

        builder.UseEnvironment("Testing");

        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

            services
                .AddAuthentication(options =>
                {
                    options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                    options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
                    options.DefaultForbidScheme = TestAuthHandler.SchemeName;
                })
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });
        });
    }
}
