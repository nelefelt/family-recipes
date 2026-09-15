using FamilyRecipes.Api.Models;

namespace FamilyRecipes.Api.Repositories;

public interface IRecipeRepository
{
    Task<IReadOnlyList<Recipe>> GetAllAsync(CancellationToken cancellationToken);
    Task<Recipe?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task AddAsync(Recipe recipe, CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
