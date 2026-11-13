using Microsoft.AspNetCore.Mvc.Testing;

namespace FamilyRecipes.Api.IntegrationTests.Infrastructure;

public static class WebApplicationFactoryExtensions
{
    // Returns a client signed in as the given user. Pass scope: null to leave out the required scope (403).
    // An extension, so it also works on factories derived with WithWebHostBuilder.
    public static HttpClient CreateAuthenticatedClient(
        this WebApplicationFactory<Program> factory,
        string externalId,
        string name,
        string? scope = "access_as_user")
    {
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, externalId);
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserNameHeader, name);

        if (scope is not null)
        {
            client.DefaultRequestHeaders.Add(TestAuthHandler.ScopeHeader, scope);
        }

        return client;
    }
}
