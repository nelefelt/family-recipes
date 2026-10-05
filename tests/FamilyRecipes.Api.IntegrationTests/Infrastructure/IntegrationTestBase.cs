using FamilyRecipes.Api.Data;
using FamilyRecipes.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FamilyRecipes.Api.IntegrationTests.Infrastructure;

// One factory for every test in this collection, so they share one SQL Server and run one at a time.
[CollectionDefinition(Name)]
public sealed class IntegrationTestCollection : ICollectionFixture<FamilyRecipesApiFactory>
{
    public const string Name = "Integration tests";
}

// Resets the database before each test and reads or seeds rows directly, without going through the API.
public abstract class IntegrationTestBase(FamilyRecipesApiFactory factory) : IAsyncLifetime
{
    protected FamilyRecipesApiFactory Factory { get; } = factory;

    // Clears leftover rows so this test cannot see data from the previous one.
    public async ValueTask InitializeAsync()
    {
        await Factory.ResetDatabaseAsync();
    }

    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    // Inserts a user in the same tenant as TestAuthHandler, so the test headers match this row.
    protected async Task<User> SeedUserAsync(string externalId, string name)
    {
        return await UseDbContextAsync(async dbContext =>
        {
            var user = new User
            {
                ExternalTenantId = TestAuthHandler.TenantId,
                ExternalUserId = externalId,
                Name = name,
            };

            dbContext.Users.Add(user);
            await dbContext.SaveChangesAsync();
            return user;
        });
    }

    // Inserts a recipe owned by userId. Each name becomes an ingredient with only Name set.
    protected async Task<Recipe> SeedRecipeAsync(int userId, params string[] ingredientNames)
    {
        return await UseDbContextAsync(async dbContext =>
        {
            var now = DateTime.UtcNow;
            var recipe = new Recipe
            {
                Title = "Seeded recipe",
                Instructions = "Seeded instructions",
                CreatedByUserId = userId,
                CreatedAt = now,
                UpdatedAt = now,
                Ingredients = ingredientNames
                    .Select(ingredientName => new Ingredient { Name = ingredientName })
                    .ToList(),
            };

            dbContext.Recipes.Add(recipe);
            await dbContext.SaveChangesAsync();
            return recipe;
        });
    }

    // Reads one recipe, including its ingredients, as stored in the database.
    protected Task<Recipe?> FindRecipeAsync(int id)
    {
        return UseDbContextAsync(dbContext =>
            dbContext.Recipes
                .AsNoTracking()
                .Include(recipe => recipe.Ingredients)
                .SingleOrDefaultAsync(recipe => recipe.Id == id));
    }

    // Reads the ingredients stored for one recipe.
    protected Task<List<Ingredient>> GetIngredientsAsync(int recipeId)
    {
        return UseDbContextAsync(dbContext =>
            dbContext.Ingredients
                .AsNoTracking()
                .Where(ingredient => ingredient.RecipeId == recipeId)
                .ToListAsync());
    }

    // Reads every user currently stored.
    protected Task<List<User>> GetUsersAsync()
    {
        return UseDbContextAsync(dbContext => dbContext.Users.AsNoTracking().ToListAsync());
    }

    // Opens a short-lived AppDbContext. Each helper gets its own, so tests do not share tracked entities.
    private async Task<T> UseDbContextAsync<T>(Func<AppDbContext, Task<T>> action)
    {
        using var scope = Factory.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await action(dbContext);
    }
}
