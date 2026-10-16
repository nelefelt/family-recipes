using System.Net;
using FamilyRecipes.Api.IntegrationTests.Infrastructure;

namespace FamilyRecipes.Api.IntegrationTests.Recipes;

[Collection(IntegrationTestCollection.Name)]
public sealed class DeleteRecipeTests(FamilyRecipesApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task DeleteRecipe_WhenUserOwnsRecipe_ReturnsNoContent()
    {
        var user = await SeedUserAsync("user-a", "User A");
        var recipe = await SeedRecipeAsync(user.Id, "Flour", "Sugar");

        var client = Factory.CreateAuthenticatedClient("user-a", "User A");
        var response = await client.DeleteAsync($"/api/recipes/{recipe.Id}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Null(await FindRecipeAsync(recipe.Id));
        Assert.Empty(await GetIngredientsAsync(recipe.Id));
    }

    [Fact]
    public async Task DeleteRecipe_WhenUserDoesNotOwnRecipe_ReturnsForbidden()
    {
        var owner = await SeedUserAsync("user-a", "User A");
        var recipe = await SeedRecipeAsync(owner.Id, "Flour", "Sugar");

        var client = Factory.CreateAuthenticatedClient("user-b", "User B");
        var response = await client.DeleteAsync($"/api/recipes/{recipe.Id}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        var storedRecipe = await FindRecipeAsync(recipe.Id);
        Assert.NotNull(storedRecipe);

        var ingredients = await GetIngredientsAsync(recipe.Id);
        Assert.Equal(2, ingredients.Count);
        Assert.Contains(ingredients, ingredient => ingredient.Name == "Flour");
        Assert.Contains(ingredients, ingredient => ingredient.Name == "Sugar");
    }

    [Fact]
    public async Task DeleteRecipe_WhenRecipeDoesNotExist_ReturnsNotFound()
    {
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");
        var response = await client.DeleteAsync("/api/recipes/1", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Null(await FindRecipeAsync(1));
        Assert.Empty(await GetUsersAsync());
    }
}
