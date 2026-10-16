using System.Net;
using System.Net.Http.Json;
using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.IntegrationTests.Infrastructure;

namespace FamilyRecipes.Api.IntegrationTests.Recipes;

[Collection(IntegrationTestCollection.Name)]
public sealed class GetRecipeTests(FamilyRecipesApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task GetRecipe_WhenOtherUserOwnsRecipe_ReturnsOk()
    {
        var owner = await SeedUserAsync("user-a", "User A");
        var recipe = await SeedRecipeAsync(owner.Id, "Flour", "Sugar");
        var client = Factory.CreateAuthenticatedClient("user-b", "User B");
        var cancellationToken = TestContext.Current.CancellationToken;

        var response = await client.GetAsync($"/api/recipes/{recipe.Id}", cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<RecipeResponse>(cancellationToken);
        Assert.NotNull(body);
        Assert.Equal(recipe.Id, body.Id);
        Assert.Equal("Seeded recipe", body.Title);
        Assert.Equal(owner.Id, body.CreatedByUserId);
    }
}
