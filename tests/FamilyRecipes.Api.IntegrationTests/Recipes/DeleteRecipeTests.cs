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
}
