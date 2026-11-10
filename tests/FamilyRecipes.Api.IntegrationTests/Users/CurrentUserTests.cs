using System.Net;
using System.Net.Http.Json;
using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.Data;
using FamilyRecipes.Api.IntegrationTests.Infrastructure;
using FamilyRecipes.Api.Models;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;

namespace FamilyRecipes.Api.IntegrationTests.Users;

[Collection(IntegrationTestCollection.Name)]
public sealed class CurrentUserTests(FamilyRecipesApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task PutCurrentUser_WithNewIdentity_CreatesUser()
    {
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");
        var response = await client.PutAsync("/api/users/me", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<UserResponse>(TestContext.Current.CancellationToken);
        Assert.NotNull(body);
        Assert.Equal("User A", body.Name);

        var user = Assert.Single(await GetUsersAsync());
        Assert.Equal(body.Id, user.Id);
        Assert.Equal("user-a", user.ExternalUserId);
        Assert.Equal(TestAuthHandler.TenantId, user.ExternalTenantId);
    }

    [Fact]
    public async Task PutCurrentUser_CalledTwiceWithSameIdentity_ReturnsSameUser()
    {
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");
        var cancellationToken = TestContext.Current.CancellationToken;

        var firstResponse = await client.PutAsync("/api/users/me", null, cancellationToken);
        var secondResponse = await client.PutAsync("/api/users/me", null, cancellationToken);

        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, secondResponse.StatusCode);

        var firstUser = await firstResponse.Content.ReadFromJsonAsync<UserResponse>(cancellationToken);
        var secondUser = await secondResponse.Content.ReadFromJsonAsync<UserResponse>(cancellationToken);
        Assert.NotNull(firstUser);
        Assert.NotNull(secondUser);
        Assert.Equal(firstUser.Id, secondUser.Id);

        var user = Assert.Single(await GetUsersAsync());
        Assert.Equal(firstUser.Id, user.Id);
    }

    // Forces the race: another request inserts the same user after our lookup but before our SaveChanges.
    [Fact]
    public async Task PutCurrentUser_WhenSameUserIsCreatedConcurrently_ReturnsThatUser()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        User? concurrentlyCreatedUser = null;
        var interceptor = new BeforeUserInsertInterceptor(async () =>
            concurrentlyCreatedUser = await SeedUserAsync("user-a", "User A"));

        // Only this factory has the interceptor. SeedUserAsync uses the base factory, so it does not trigger it.
        await using var racingFactory = Factory.WithWebHostBuilder(builder =>
            builder.ConfigureTestServices(services =>
                services.ConfigureDbContext<AppDbContext>(options => options.AddInterceptors(interceptor))));

        var client = racingFactory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, "user-a");
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserNameHeader, "User A");
        client.DefaultRequestHeaders.Add(TestAuthHandler.ScopeHeader, "access_as_user");

        var response = await client.PutAsync("/api/users/me", null, cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(concurrentlyCreatedUser);

        var body = await response.Content.ReadFromJsonAsync<UserResponse>(cancellationToken);
        Assert.NotNull(body);
        Assert.Equal(concurrentlyCreatedUser.Id, body.Id);

        var user = Assert.Single(await GetUsersAsync());
        Assert.Equal(concurrentlyCreatedUser.Id, user.Id);
    }

    // Smoke test of the invariant. Passing does not prove the catch branch ran, since requests may not overlap.
    [Fact]
    public async Task PutCurrentUser_CalledInParallelWithSameIdentity_CreatesOneUser()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");

        var responses = await Task.WhenAll(
            Enumerable.Range(0, 10).Select(_ => client.PutAsync("/api/users/me", null, cancellationToken)));

        Assert.All(responses, response => Assert.Equal(HttpStatusCode.OK, response.StatusCode));

        var users = await Task.WhenAll(
            responses.Select(response => response.Content.ReadFromJsonAsync<UserResponse>(cancellationToken)));
        var storedUser = Assert.Single(await GetUsersAsync());
        Assert.All(users, user => Assert.Equal(storedUser.Id, user?.Id));
    }

    // Runs the callback once, just before the first SaveChanges that inserts a user.
    private sealed class BeforeUserInsertInterceptor(Func<Task> beforeInsert) : SaveChangesInterceptor
    {
        private int _hasRun;

        public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            var insertsUser = eventData.Context?.ChangeTracker
                .Entries<User>()
                .Any(entry => entry.State == EntityState.Added) ?? false;

            if (insertsUser && Interlocked.Exchange(ref _hasRun, 1) == 0)
            {
                await beforeInsert();
            }

            return result;
        }
    }
}
