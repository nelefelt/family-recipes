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

    public async Task AddAsync(Recipe recipe, CancellationToken cancellationToken)
    {
        await dbContext.Recipes.AddAsync(recipe, cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
