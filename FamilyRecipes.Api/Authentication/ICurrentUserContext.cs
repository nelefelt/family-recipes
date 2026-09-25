namespace FamilyRecipes.Api.Authentication;

public interface ICurrentUserContext
{
    string GetRequiredTenantId();
    string GetRequiredObjectId();
    string? GetDisplayName();
}
