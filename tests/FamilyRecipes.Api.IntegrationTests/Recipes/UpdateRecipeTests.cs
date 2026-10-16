using System.Net;
using System.Net.Http.Json;
using FamilyRecipes.Api.DTOs.Requests;
using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.IntegrationTests.Infrastructure;

namespace FamilyRecipes.Api.IntegrationTests.Recipes;

[Collection(IntegrationTestCollection.Name)]
public sealed class UpdateRecipeTests(FamilyRecipesApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task UpdateRecipe_WhenUserDoesNotOwnRecipe_ReturnsForbidden()
    {
        var owner = await SeedUserAsync("user-a", "User A");
        var recipe = await SeedRecipeAsync(owner.Id, "Flour", "Sugar");
        var originalIngredientIds = recipe.Ingredients.Select(ingredient => ingredient.Id).Order().ToArray();

        var client = Factory.CreateAuthenticatedClient("user-b", "User B");
        var response = await client.PutAsJsonAsync(
            $"/api/recipes/{recipe.Id}",
            new UpdateRecipeRequest
            {
                Title = "Changed title",
                Instructions = "Changed instructions",
                Ingredients = [new IngredientRequest { Name = "Salt", Amount = 1, Unit = "tsp" }],
            },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);

        var storedRecipe = await FindRecipeAsync(recipe.Id);
        Assert.NotNull(storedRecipe);
        Assert.Equal("Seeded recipe", storedRecipe.Title);
        Assert.Equal("Seeded instructions", storedRecipe.Instructions);
        Assert.Equal(originalIngredientIds, storedRecipe.Ingredients.Select(ingredient => ingredient.Id).Order());
        Assert.Contains(storedRecipe.Ingredients, ingredient => ingredient.Name == "Flour");
        Assert.Contains(storedRecipe.Ingredients, ingredient => ingredient.Name == "Sugar");
    }

    [Fact]
    public async Task UpdateRecipe_WhenUserOwnsRecipe_ReturnsOkAndReplacesIngredients()
    {
        var owner = await SeedUserAsync("user-a", "User A");
        var recipe = await SeedRecipeAsync(owner.Id, "Flour", "Sugar");
        var originalIngredientIds = recipe.Ingredients.Select(ingredient => ingredient.Id).ToArray();
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");
        var cancellationToken = TestContext.Current.CancellationToken;

        var response = await client.PutAsJsonAsync(
            $"/api/recipes/{recipe.Id}",
            new UpdateRecipeRequest
            {
                Title = "Updated pancakes",
                Description = "Dinner",
                Instructions = "Bake",
                Ingredients =
                [
                    new IngredientRequest { Name = "Butter", Amount = 50, Unit = "g" },
                    new IngredientRequest { Name = "Flour", Amount = 4, Unit = "dl" },
                ],
            },
            cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<RecipeResponse>(cancellationToken);
        Assert.NotNull(body);
        Assert.Equal("Updated pancakes", body.Title);
        Assert.Equal("Dinner", body.Description);
        Assert.Equal("Bake", body.Instructions);
        Assert.Equal(owner.Id, body.CreatedByUserId);

        var storedRecipe = await FindRecipeAsync(recipe.Id);
        Assert.NotNull(storedRecipe);
        Assert.Equal("Updated pancakes", storedRecipe.Title);
        Assert.Equal("Dinner", storedRecipe.Description);
        Assert.Equal("Bake", storedRecipe.Instructions);
        Assert.Equal(owner.Id, storedRecipe.CreatedByUserId);
        Assert.DoesNotContain(storedRecipe.Ingredients, ingredient => originalIngredientIds.Contains(ingredient.Id));

        var ingredients = storedRecipe.Ingredients.OrderBy(ingredient => ingredient.Name).ToArray();
        Assert.Equal(2, ingredients.Length);
        Assert.Equal("Butter", ingredients[0].Name);
        Assert.Equal(50, ingredients[0].Amount);
        Assert.Equal("g", ingredients[0].Unit);
        Assert.Equal("Flour", ingredients[1].Name);
        Assert.Equal(4, ingredients[1].Amount);
        Assert.Equal("dl", ingredients[1].Unit);
    }
}
