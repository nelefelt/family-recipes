using System.Net;
using System.Net.Http.Json;
using System.Text;
using FamilyRecipes.Api.DTOs.Requests;
using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.IntegrationTests.Infrastructure;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

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
                Version = recipe.RowVersion,
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
                Version = recipe.RowVersion,
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

        Assert.NotEqual(recipe.RowVersion, body.Version);
        Assert.Equal(storedRecipe.RowVersion, body.Version);
    }

    [Fact]
    public async Task UpdateRecipe_WithStaleVersion_ReturnsConflictAndKeepsFirstSave()
    {
        var owner = await SeedUserAsync("user-a", "User A");
        var recipe = await SeedRecipeAsync(owner.Id, "Flour");
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");
        var cancellationToken = TestContext.Current.CancellationToken;

        var firstResponse = await client.PutAsJsonAsync(
            $"/api/recipes/{recipe.Id}",
            CreateUpdateRequest("First save", recipe.RowVersion),
            cancellationToken);
        var secondResponse = await client.PutAsJsonAsync(
            $"/api/recipes/{recipe.Id}",
            CreateUpdateRequest("Second save", recipe.RowVersion),
            cancellationToken);

        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);

        var storedRecipe = await FindRecipeAsync(recipe.Id);
        Assert.NotNull(storedRecipe);
        Assert.Equal("First save", storedRecipe.Title);
    }

    [Fact]
    public async Task UpdateRecipe_WithMalformedVersion_ReturnsBadRequest()
    {
        var owner = await SeedUserAsync("user-a", "User A");
        var recipe = await SeedRecipeAsync(owner.Id, "Flour");
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");

        var response = await client.PutAsync(
            $"/api/recipes/{recipe.Id}",
            new StringContent(
                """
                {
                  "title": "Changed",
                  "instructions": "Changed",
                  "ingredients": [{ "name": "Salt" }],
                  "version": "not base64!"
                }
                """,
                Encoding.UTF8,
                "application/json"),
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task UpdateRecipe_WhenOnlyIngredientsChange_ChangesVersion()
    {
        var owner = await SeedUserAsync("user-a", "User A");
        var recipe = await SeedRecipeAsync(owner.Id, "Flour");
        var cancellationToken = TestContext.Current.CancellationToken;

        // Freeze the clock at the stored UpdatedAt, so the save does not change any recipe column.
        var frozenTime = new FixedTimeProvider(new DateTimeOffset(DateTime.SpecifyKind(recipe.UpdatedAt, DateTimeKind.Utc)));
        await using var frozenClockFactory = Factory.WithWebHostBuilder(builder =>
            builder.ConfigureTestServices(services => services.AddSingleton<TimeProvider>(frozenTime)));

        var client = frozenClockFactory.CreateAuthenticatedClient("user-a", "User A");

        var response = await client.PutAsJsonAsync(
            $"/api/recipes/{recipe.Id}",
            new UpdateRecipeRequest
            {
                Title = recipe.Title,
                Description = recipe.Description,
                Instructions = recipe.Instructions,
                Ingredients = [new IngredientRequest { Name = "Sugar" }],
                Version = recipe.RowVersion,
            },
            cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var storedRecipe = await FindRecipeAsync(recipe.Id);
        Assert.NotNull(storedRecipe);
        Assert.Equal("Sugar", Assert.Single(storedRecipe.Ingredients).Name);
        Assert.NotEqual(recipe.RowVersion, storedRecipe.RowVersion);
    }

    private static UpdateRecipeRequest CreateUpdateRequest(string title, byte[] version) => new()
    {
        Title = title,
        Instructions = "Bake",
        Ingredients = [new IngredientRequest { Name = "Flour" }],
        Version = version,
    };

    private sealed class FixedTimeProvider(DateTimeOffset now) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => now;
    }
}
