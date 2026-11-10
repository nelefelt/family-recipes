using FamilyRecipes.Api.Models;

namespace FamilyRecipes.Api.Repositories;

public interface IUserRepository
{
    Task<User?> GetByExternalIdentityAsync(
        string externalTenantId,
        string externalUserId,
        CancellationToken cancellationToken);

    Task AddAsync(User user, CancellationToken cancellationToken);

    void Detach(User user);

    Task SaveChangesAsync(CancellationToken cancellationToken);
}
