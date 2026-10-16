using System.Net;
using System.Net.Http.Json;
using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.IntegrationTests.Infrastructure;

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
}
