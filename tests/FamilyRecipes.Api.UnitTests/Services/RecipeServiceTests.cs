using FamilyRecipes.Api.DTOs.Requests;
using FamilyRecipes.Api.Exceptions;
using FamilyRecipes.Api.Models;
using FamilyRecipes.Api.Repositories;
using FamilyRecipes.Api.Services;
using Microsoft.Extensions.Time.Testing;
using NSubstitute;

namespace FamilyRecipes.Api.UnitTests.Services;

public sealed class RecipeServiceTests
{
    private static readonly DateTimeOffset Now = new(2026, 1, 15, 10, 0, 0, TimeSpan.Zero);

    private readonly IRecipeRepository _recipeRepository = Substitute.For<IRecipeRepository>();
    private readonly IUserService _userService = Substitute.For<IUserService>();
    private readonly FakeTimeProvider _timeProvider = new(Now);
    private readonly RecipeService _sut;

    public RecipeServiceTests()
    {
        _sut = new RecipeService(_recipeRepository, _userService, _timeProvider);
    }

    [Fact]
    public async Task DeleteRecipeAsync_WhenUserDoesNotOwnRecipe_ThrowsForbidden()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var owner = CreateUser(id: 1, externalId: "user-a");
        var otherUser = CreateUser(id: 2, externalId: "user-b");
        var recipe = CreateRecipe(id: 10, owner);
        _recipeRepository.GetByIdForUpdateAsync(recipe.Id, cancellationToken).Returns(recipe);
        _userService.GetOrCreateCurrentAsync(cancellationToken).Returns(otherUser);

        await Assert.ThrowsAsync<RecipeForbiddenException>(
            () => _sut.DeleteRecipeAsync(recipe.Id, cancellationToken));

        _recipeRepository.DidNotReceive().Delete(Arg.Any<Recipe>());
        await _recipeRepository.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task CreateRecipeAsync_WithValidRequest_SetsOwnerTimestampsAndIngredients()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var owner = CreateUser(id: 1, externalId: "user-a");
        _userService.GetOrCreateCurrentAsync(cancellationToken).Returns(owner);

        Recipe? addedRecipe = null;
        _recipeRepository
            .AddAsync(Arg.Do<Recipe>(recipe => addedRecipe = recipe), cancellationToken)
            .Returns(Task.CompletedTask);

        var request = new CreateRecipeRequest
        {
            Title = "Pancakes",
            Description = "Breakfast",
            Instructions = "Mix and fry",
            Ingredients =
            [
                new IngredientRequest { Name = "Flour", Amount = 2, Unit = "dl" },
                new IngredientRequest { Name = "Milk", Amount = 3, Unit = "dl" },
            ],
        };

        var response = await _sut.CreateRecipeAsync(request, cancellationToken);

        Assert.NotNull(addedRecipe);
        await _recipeRepository.Received(1).AddAsync(addedRecipe, cancellationToken);
        Assert.Equal(request.Title, addedRecipe.Title);
        Assert.Equal(request.Description, addedRecipe.Description);
        Assert.Equal(request.Instructions, addedRecipe.Instructions);
        Assert.Equal(owner.Id, addedRecipe.CreatedByUserId);
        Assert.Equal(Now.UtcDateTime, addedRecipe.CreatedAt);
        Assert.Equal(Now.UtcDateTime, addedRecipe.UpdatedAt);
        Assert.Collection(
            addedRecipe.Ingredients,
            ingredient =>
            {
                Assert.Equal("Flour", ingredient.Name);
                Assert.Equal(2, ingredient.Amount);
                Assert.Equal("dl", ingredient.Unit);
            },
            ingredient =>
            {
                Assert.Equal("Milk", ingredient.Name);
                Assert.Equal(3, ingredient.Amount);
                Assert.Equal("dl", ingredient.Unit);
            });
        Assert.Equal(owner.Id, response.CreatedByUserId);
        await _recipeRepository.Received(1).SaveChangesAsync(cancellationToken);
    }

    [Fact]
    public async Task UpdateRecipeAsync_WhenUserOwnsRecipe_ReplacesIngredientsAndSetsUpdatedAt()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var owner = CreateUser(id: 1, externalId: "user-a");
        var recipe = CreateRecipe(id: 10, owner);
        recipe.Ingredients.Add(new Ingredient { Id = 100, Name = "Flour" });
        recipe.Ingredients.Add(new Ingredient { Id = 101, Name = "Sugar" });
        _recipeRepository.GetByIdForUpdateAsync(recipe.Id, cancellationToken).Returns(recipe);
        _userService.GetOrCreateCurrentAsync(cancellationToken).Returns(owner);
        _timeProvider.Advance(TimeSpan.FromHours(2));

        var request = new UpdateRecipeRequest
        {
            Title = "Updated pancakes",
            Instructions = "Bake",
            Ingredients = [new IngredientRequest { Name = "Butter", Amount = 50, Unit = "g" }],
        };

        await _sut.UpdateRecipeAsync(recipe.Id, request, cancellationToken);

        Assert.Equal(request.Title, recipe.Title);
        Assert.Equal(request.Instructions, recipe.Instructions);
        Assert.Equal(owner.Id, recipe.CreatedByUserId);
        Assert.Equal(Now.UtcDateTime, recipe.CreatedAt);
        Assert.Equal(Now.AddHours(2).UtcDateTime, recipe.UpdatedAt);

        var ingredient = Assert.Single(recipe.Ingredients);
        Assert.Equal("Butter", ingredient.Name);
        Assert.Equal(50, ingredient.Amount);
        Assert.Equal("g", ingredient.Unit);
        await _recipeRepository.Received(1).SaveChangesAsync(cancellationToken);
    }

    private static User CreateUser(int id, string externalId) => new()
    {
        Id = id,
        ExternalTenantId = "tenant-1",
        ExternalUserId = externalId,
        Name = externalId,
    };

    private static Recipe CreateRecipe(int id, User owner) => new()
    {
        Id = id,
        Title = "Original title",
        Instructions = "Original instructions",
        CreatedByUserId = owner.Id,
        CreatedByUser = owner,
        CreatedAt = Now.UtcDateTime,
        UpdatedAt = Now.UtcDateTime,
    };
}
