using System.Security.Claims;
using FamilyRecipes.Api.Authentication;
using FamilyRecipes.Api.Exceptions;
using Microsoft.AspNetCore.Http;

namespace FamilyRecipes.Api.UnitTests.Authentication;

public sealed class CurrentUserContextTests
{
    [Fact]
    public void GetRequiredObjectId_WhenOidClaimMissing_ThrowsIdentityException()
    {
        // An authentication type makes the identity count as authenticated.
        var identity = new ClaimsIdentity([new Claim("tid", "tenant-1")], authenticationType: "Test");
        var httpContextAccessor = new HttpContextAccessor
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) },
        };
        var sut = new CurrentUserContext(httpContextAccessor);

        Assert.Throws<CurrentUserIdentityException>(() => sut.GetRequiredObjectId());
    }
}
