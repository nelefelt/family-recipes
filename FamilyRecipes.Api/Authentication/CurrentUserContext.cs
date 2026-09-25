using System.Security.Claims;
using FamilyRecipes.Api.Exceptions;
using Microsoft.Identity.Web;

namespace FamilyRecipes.Api.Authentication;

public sealed class CurrentUserContext(IHttpContextAccessor httpContextAccessor) : ICurrentUserContext
{
    public string GetRequiredTenantId()
    {
        var tenantId = GetAuthenticatedUser().GetTenantId();

        if (string.IsNullOrWhiteSpace(tenantId))
        {
            throw new CurrentUserIdentityException("The authenticated user is missing the 'tid' claim.");
        }

        return tenantId;
    }

    public string GetRequiredObjectId()
    {
        var objectId = GetAuthenticatedUser().GetObjectId();

        if (string.IsNullOrWhiteSpace(objectId))
        {
            throw new CurrentUserIdentityException("The authenticated user is missing the 'oid' claim.");
        }

        return objectId;
    }

    public string? GetDisplayName()
    {
        var user = GetAuthenticatedUser();
        var name = user.FindFirstValue("name");

        if (!string.IsNullOrWhiteSpace(name))
        {
            return name;
        }

        var identityName = user.Identity?.Name;

        if (!string.IsNullOrWhiteSpace(identityName))
        {
            return identityName;
        }

        return null;
    }

    private ClaimsPrincipal GetAuthenticatedUser()
    {
        var httpContext = httpContextAccessor.HttpContext;

        if (httpContext is null)
        {
            throw new InvalidOperationException(
                "CurrentUserContext can only be used during an HTTP request.");
        }

        var user = httpContext.User;

        if (user.Identity?.IsAuthenticated != true)
        {
            throw new CurrentUserIdentityException("The current user is not authenticated.");
        }

        return user;
    }
}
