using FamilyRecipes.Api.Data;
using FamilyRecipes.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FamilyRecipes.Api.Repositories;

public class RecipeRepository(AppDbContext dbContext) : IRecipeRepository
{
    public async Task<IReadOnlyList<Recipe>> GetAllAsync(CancellationToken cancellationToken)
    {
        return await dbContext.Recipes
            .AsNoTracking()
            .Include(recipe => recipe.CreatedByUser)
            .Include(recipe => recipe.Ingredients)
            .OrderByDescending(recipe => recipe.CreatedAt)
            .ThenByDescending(recipe => recipe.Id)
            .ToListAsync(cancellationToken);
    }

    public Task<Recipe?> GetByIdAsync(int id, CancellationToken cancellationToken)
    {
        return dbContext.Recipes
            .AsNoTracking()
            .Include(recipe => recipe.CreatedByUser)
            .Include(recipe => recipe.Ingredients)
            .FirstOrDefaultAsync(recipe => recipe.Id == id, cancellationToken);
    }

    public Task<Recipe?> GetByIdForUpdateAsync(int id, CancellationToken cancellationToken)
    {
        return dbContext.Recipes
            .Include(recipe => recipe.Ingredients)
            .FirstOrDefaultAsync(recipe => recipe.Id == id, cancellationToken);
    }

    public Task<Recipe?> GetByIdempotencyKeyAsync(int ownerId, Guid idempotencyKey, CancellationToken cancellationToken)
    {
        return dbContext.Recipes
            .AsNoTracking()
            .Include(recipe => recipe.CreatedByUser)
            .Include(recipe => recipe.Ingredients)
            .FirstOrDefaultAsync(
                recipe => recipe.CreatedByUserId == ownerId && recipe.IdempotencyKey == idempotencyKey,
                cancellationToken);
    }

    public async Task AddAsync(Recipe recipe, CancellationToken cancellationToken)
    {
        await dbContext.Recipes.AddAsync(recipe, cancellationToken);
    }

    // Detaching does not cascade, so the ingredients added with the recipe are detached one by one.
    // Iterates over a copy: EF removes each detached ingredient from recipe.Ingredients.
    public void Detach(Recipe recipe)
    {
        foreach (var ingredient in recipe.Ingredients.ToList())
        {
            dbContext.Entry(ingredient).State = EntityState.Detached;
        }

        dbContext.Entry(recipe).State = EntityState.Detached;
    }

    // One DELETE statement with no prior read, so nothing can change in between. The database's
    // ON DELETE CASCADE removes the ingredients.
    public Task<int> DeleteOwnedAsync(int id, int ownerId, CancellationToken cancellationToken)
    {
        return dbContext.Recipes
            .Where(recipe => recipe.Id == id && recipe.CreatedByUserId == ownerId)
            .ExecuteDeleteAsync(cancellationToken);
    }

    public void PrepareConcurrencyCheck(Recipe recipe, byte[] expectedVersion)
    {
        var entry = dbContext.Entry(recipe);

        // EF Core puts the original RowVersion in the UPDATE's WHERE clause, so use the client's version.
        entry.Property(r => r.RowVersion).OriginalValue = expectedVersion;

        // Ingredients live in their own table. Without this, an ingredient-only change would not
        // update the recipe row, so the version would be neither checked nor changed.
        entry.Property(r => r.UpdatedAt).IsModified = true;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
