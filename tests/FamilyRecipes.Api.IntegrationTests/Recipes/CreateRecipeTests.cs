using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http;
using FamilyRecipes.Api.DTOs.Requests;
using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.IntegrationTests.Infrastructure;

namespace FamilyRecipes.Api.IntegrationTests.Recipes;

[Collection(IntegrationTestCollection.Name)]
public sealed class CreateRecipeTests(FamilyRecipesApiFactory factory) : IntegrationTestBase(factory)
{
    [Fact]
    public async Task CreateRecipe_WithValidRequest_ReturnsCreatedAndSavesIngredients()
    {
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");
        var cancellationToken = TestContext.Current.CancellationToken;
        var response = await client.PostAsJsonAsync(
            "/api/recipes",
            new CreateRecipeRequest
            {
                Title = "Pancakes",
                Description = "Breakfast",
                Instructions = "Mix and fry",
                Ingredients =
                [
                    new IngredientRequest { Name = "Flour", Amount = 2, Unit = "dl" },
                    new IngredientRequest { Name = "Milk", Amount = 3, Unit = "dl" },
                ],
            },
            cancellationToken);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<RecipeResponse>(cancellationToken);
        Assert.NotNull(body);
        Assert.NotNull(response.Headers.Location);
        Assert.EndsWith($"/api/recipes/{body.Id}", response.Headers.Location.ToString());

        var owner = Assert.Single(await GetUsersAsync());
        Assert.Equal("user-a", owner.ExternalUserId);
        Assert.Equal(owner.Id, body.CreatedByUserId);

        var storedRecipe = await FindRecipeAsync(body.Id);
        Assert.NotNull(storedRecipe);
        Assert.Equal(owner.Id, storedRecipe.CreatedByUserId);
        Assert.Equal("Pancakes", storedRecipe.Title);

        var ingredients = storedRecipe.Ingredients.OrderBy(ingredient => ingredient.Name).ToArray();
        Assert.Equal(2, ingredients.Length);
        Assert.Equal("Flour", ingredients[0].Name);
        Assert.Equal(2, ingredients[0].Amount);
        Assert.Equal("dl", ingredients[0].Unit);
        Assert.Equal("Milk", ingredients[1].Name);
        Assert.Equal(3, ingredients[1].Amount);
        Assert.Equal("dl", ingredients[1].Unit);
    }

    [Fact]
    public async Task CreateRecipe_WithEmptyTitle_ReturnsBadRequestAndSavesNothing()
    {
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");
        var cancellationToken = TestContext.Current.CancellationToken;
        var response = await client.PostAsJsonAsync(
            "/api/recipes",
            new CreateRecipeRequest
            {
                Title = "",
                Instructions = "Mix and fry",
                Ingredients = [new IngredientRequest { Name = "Flour", Amount = 2, Unit = "dl" }],
            },
            cancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await response.Content.ReadFromJsonAsync<HttpValidationProblemDetails>(cancellationToken);
        Assert.NotNull(problem);
        Assert.Contains("Title", problem.Errors.Keys);
        Assert.Null(await FindRecipeAsync(1));
        Assert.Empty(await GetUsersAsync());
    }
}
