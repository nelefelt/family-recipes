using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http;
using FamilyRecipes.Api.DTOs.Requests;
using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.Data;
using FamilyRecipes.Api.IntegrationTests.Infrastructure;
using FamilyRecipes.Api.Models;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

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

    [Fact]
    public async Task CreateRecipe_RetriedWithSameKey_ReturnsTheFirstRecipe()
    {
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");
        var key = Guid.NewGuid();

        var firstResponse = await PostRecipeAsync(client, CreateRequest("Pancakes"), key);
        var retryResponse = await PostRecipeAsync(client, CreateRequest("Pancakes"), key);

        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);
        Assert.Equal(HttpStatusCode.Created, retryResponse.StatusCode);
        var firstRecipe = await ReadRecipeAsync(firstResponse);
        var retriedRecipe = await ReadRecipeAsync(retryResponse);
        Assert.Equal(firstRecipe.Id, retriedRecipe.Id);
        Assert.Single(await GetRecipesAsync(client));
    }

    [Fact]
    public async Task CreateRecipe_WithSameKeyAndDifferentContent_ReturnsUnprocessableEntity()
    {
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");
        var key = Guid.NewGuid();

        await PostRecipeAsync(client, CreateRequest("Pancakes"), key);
        var response = await PostRecipeAsync(client, CreateRequest("Waffles"), key);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        Assert.Equal("Pancakes", Assert.Single(await GetRecipesAsync(client)).Title);
    }

    // The key only has to be unique per user, so two users cannot block each other.
    [Fact]
    public async Task CreateRecipe_WithSameKeyFromDifferentUsers_CreatesTwoRecipes()
    {
        var clientA = Factory.CreateAuthenticatedClient("user-a", "User A");
        var clientB = Factory.CreateAuthenticatedClient("user-b", "User B");
        var key = Guid.NewGuid();

        var responseA = await PostRecipeAsync(clientA, CreateRequest("Pancakes"), key);
        var responseB = await PostRecipeAsync(clientB, CreateRequest("Pancakes"), key);

        Assert.Equal(HttpStatusCode.Created, responseA.StatusCode);
        Assert.Equal(HttpStatusCode.Created, responseB.StatusCode);
        Assert.Equal(2, (await GetRecipesAsync(clientA)).Count);
    }

    [Fact]
    public async Task CreateRecipe_WithoutKey_CreatesANewRecipeEachTime()
    {
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");

        await PostRecipeAsync(client, CreateRequest("Pancakes"), idempotencyKey: null);
        await PostRecipeAsync(client, CreateRequest("Pancakes"), idempotencyKey: null);

        Assert.Equal(2, (await GetRecipesAsync(client)).Count);
    }

    [Fact]
    public async Task CreateRecipe_WithMalformedKey_ReturnsBadRequest()
    {
        var client = Factory.CreateAuthenticatedClient("user-a", "User A");
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
        {
            Content = JsonContent.Create(CreateRequest("Pancakes")),
        };
        request.Headers.Add("Idempotency-Key", "not-a-guid");

        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    // Forces the race: a request with the same key saves after our lookup but before our SaveChanges.
    [Theory]
    [InlineData("Pancakes", HttpStatusCode.Created)]
    [InlineData("Waffles", HttpStatusCode.UnprocessableEntity)]
    public async Task CreateRecipe_WhenSameKeyIsSavedConcurrently_ChecksTheContentOfThatRecipe(
        string concurrentTitle,
        HttpStatusCode expectedStatus)
    {
        var key = Guid.NewGuid();
        var otherClient = Factory.CreateAuthenticatedClient("user-a", "User A");
        RecipeResponse? concurrentlyCreatedRecipe = null;

        // The base factory has no interceptor, so this request saves normally and wins the race.
        var interceptor = new BeforeInsertInterceptor<Recipe>(async () =>
        {
            var response = await PostRecipeAsync(otherClient, CreateRequest(concurrentTitle), key);
            concurrentlyCreatedRecipe = await ReadRecipeAsync(response);
        });
        await using var racingFactory = Factory.WithWebHostBuilder(builder =>
            builder.ConfigureTestServices(services =>
                services.ConfigureDbContext<AppDbContext>(options => options.AddInterceptors(interceptor))));
        var client = racingFactory.CreateAuthenticatedClient("user-a", "User A");

        var response = await PostRecipeAsync(client, CreateRequest("Pancakes"), key);

        Assert.Equal(expectedStatus, response.StatusCode);
        Assert.NotNull(concurrentlyCreatedRecipe);
        var storedRecipe = Assert.Single(await GetRecipesAsync(otherClient));
        Assert.Equal(concurrentlyCreatedRecipe.Id, storedRecipe.Id);

        if (expectedStatus == HttpStatusCode.Created)
        {
            Assert.Equal(concurrentlyCreatedRecipe.Id, (await ReadRecipeAsync(response)).Id);
        }
    }

    private static CreateRecipeRequest CreateRequest(string title) => new()
    {
        Title = title,
        Instructions = "Mix and fry",
        Ingredients = [new IngredientRequest { Name = "Flour", Amount = 2, Unit = "dl" }],
    };

    private static async Task<HttpResponseMessage> PostRecipeAsync(
        HttpClient client,
        CreateRecipeRequest request,
        Guid? idempotencyKey)
    {
        using var message = new HttpRequestMessage(HttpMethod.Post, "/api/recipes")
        {
            Content = JsonContent.Create(request),
        };

        if (idempotencyKey is not null)
        {
            message.Headers.Add("Idempotency-Key", idempotencyKey.Value.ToString());
        }

        return await client.SendAsync(message, TestContext.Current.CancellationToken);
    }

    private static async Task<RecipeResponse> ReadRecipeAsync(HttpResponseMessage response)
    {
        var recipe = await response.Content.ReadFromJsonAsync<RecipeResponse>(TestContext.Current.CancellationToken);
        Assert.NotNull(recipe);
        return recipe;
    }

    private static async Task<List<RecipeResponse>> GetRecipesAsync(HttpClient client)
    {
        var recipes = await client.GetFromJsonAsync<List<RecipeResponse>>(
            "/api/recipes",
            TestContext.Current.CancellationToken);
        Assert.NotNull(recipes);
        return recipes;
    }
}
