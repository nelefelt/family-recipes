using System.Net;
using FamilyRecipes.Api.IntegrationTests.Infrastructure;

namespace FamilyRecipes.Api.IntegrationTests.Users;

[Collection(IntegrationTestCollection.Name)]
public sealed class AuthorizationTests(FamilyRecipesApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task GetRecipes_WithoutAuthentication_ReturnsUnauthorized()
    {
        var owner = await SeedUserAsync("user-a", "User A");
        var recipe = await SeedRecipeAsync(owner.Id, "Flour", "Sugar");
        var client = Factory.CreateClient();

        var response = await client.GetAsync("/api/recipes", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        await AssertRecipeUnchangedAsync(recipe.Id, owner.Id);
    }

    [Fact]
    public async Task GetRecipes_WithoutRequiredScope_ReturnsForbidden()
    {
        var owner = await SeedUserAsync("user-a", "User A");
        var recipe = await SeedRecipeAsync(owner.Id, "Flour", "Sugar");
        var client = Factory.CreateAuthenticatedClient("user-a", "User A", scope: null);

        var response = await client.GetAsync("/api/recipes", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        await AssertRecipeUnchangedAsync(recipe.Id, owner.Id);
    }

    private async Task AssertRecipeUnchangedAsync(int recipeId, int ownerId)
    {
        var storedRecipe = await FindRecipeAsync(recipeId);
        Assert.NotNull(storedRecipe);
        Assert.Equal("Seeded recipe", storedRecipe.Title);
        Assert.Equal("Seeded instructions", storedRecipe.Instructions);
        Assert.Equal(ownerId, storedRecipe.CreatedByUserId);
        Assert.Equal(2, storedRecipe.Ingredients.Count);
        Assert.Contains(storedRecipe.Ingredients, ingredient => ingredient.Name == "Flour");
        Assert.Contains(storedRecipe.Ingredients, ingredient => ingredient.Name == "Sugar");

        var users = await GetUsersAsync();
        var user = Assert.Single(users);
        Assert.Equal(ownerId, user.Id);
    }
}
