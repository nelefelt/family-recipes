using FamilyRecipes.Api.Authentication;
using FamilyRecipes.Api.Models;
using FamilyRecipes.Api.Repositories;

namespace FamilyRecipes.Api.Services;

public sealed class UserService(
    IUserRepository userRepository,
    ICurrentUserContext currentUserContext) : IUserService
{
    public async Task<User> GetOrCreateCurrentAsync(CancellationToken cancellationToken)
    {
        var tenantId = currentUserContext.GetRequiredTenantId();
        var objectId = currentUserContext.GetRequiredObjectId();
        var existingUser = await userRepository.GetByExternalIdentityAsync(
            tenantId,
            objectId,
            cancellationToken);

        if (existingUser is not null)
        {
            return existingUser;
        }

        var displayName = currentUserContext.GetDisplayName();
        var user = new User
        {
            ExternalTenantId = tenantId,
            ExternalUserId = objectId,
            Name = string.IsNullOrWhiteSpace(displayName) ? "New user" : displayName
        };

        await userRepository.AddAsync(user, cancellationToken);
        await userRepository.SaveChangesAsync(cancellationToken);

        return user;
    }
}
