using FamilyRecipes.Api.Data;
using FamilyRecipes.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FamilyRecipes.Api.Repositories;

public sealed class UserRepository(AppDbContext dbContext) : IUserRepository
{
    public Task<User?> GetByExternalIdentityAsync(
        string externalTenantId,
        string externalUserId,
        CancellationToken cancellationToken)
    {
        return dbContext.Users.SingleOrDefaultAsync(
            user =>
                user.ExternalTenantId == externalTenantId &&
                user.ExternalUserId == externalUserId,
            cancellationToken);
    }

    public async Task AddAsync(User user, CancellationToken cancellationToken)
    {
        await dbContext.Users.AddAsync(user, cancellationToken);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
