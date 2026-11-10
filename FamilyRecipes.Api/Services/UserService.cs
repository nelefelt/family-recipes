using FamilyRecipes.Api.Authentication;
using FamilyRecipes.Api.Data;
using FamilyRecipes.Api.Models;
using FamilyRecipes.Api.Repositories;
using Microsoft.EntityFrameworkCore;

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

        try
        {
            await userRepository.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (exception.IsUniqueConstraintViolation())
        {
            // A concurrent request created the same user first. The unique index kept the data correct.
            // Detach the failed entity so a later SaveChanges in this request does not insert it again.
            userRepository.Detach(user);

            var concurrentlyCreatedUser = await userRepository.GetByExternalIdentityAsync(
                tenantId,
                objectId,
                cancellationToken);

            if (concurrentlyCreatedUser is null)
            {
                throw;
            }

            return concurrentlyCreatedUser;
        }

        return user;
    }
}
