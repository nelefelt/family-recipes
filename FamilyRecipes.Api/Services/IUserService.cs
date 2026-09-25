using FamilyRecipes.Api.Models;

namespace FamilyRecipes.Api.Services;

public interface IUserService
{
    Task<User> GetOrCreateCurrentAsync(CancellationToken cancellationToken);
}
