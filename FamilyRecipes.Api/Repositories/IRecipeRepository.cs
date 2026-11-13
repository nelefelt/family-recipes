using FamilyRecipes.Api.Models;

namespace FamilyRecipes.Api.Repositories;

public interface IRecipeRepository
{
    Task<IReadOnlyList<Recipe>> GetAllAsync(CancellationToken cancellationToken);
    Task<Recipe?> GetByIdAsync(int id, CancellationToken cancellationToken);
    Task<Recipe?> GetByIdForUpdateAsync(int id, CancellationToken cancellationToken);
    Task<Recipe?> GetByIdempotencyKeyAsync(int ownerId, Guid idempotencyKey, CancellationToken cancellationToken);
    Task AddAsync(Recipe recipe, CancellationToken cancellationToken);
    void Detach(Recipe recipe);
    Task<int> DeleteOwnedAsync(int id, int ownerId, CancellationToken cancellationToken);
    void PrepareConcurrencyCheck(Recipe recipe, byte[] expectedVersion);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}
