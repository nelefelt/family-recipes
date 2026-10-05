using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace FamilyRecipes.Api.IntegrationTests.Infrastructure;

// Replaces Entra in tests. Headers become the same claims the API reads: oid, tid, name, and scp.
// A missing user id leaves the request unauthenticated (401). A missing scope header adds no scp claim (403).
public sealed class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "Test";
    public const string TenantId = "11111111-1111-1111-1111-111111111111";
    public const string UserIdHeader = "X-Test-User-Id";
    public const string UserNameHeader = "X-Test-User-Name";
    public const string ScopeHeader = "X-Test-Scope";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue(UserIdHeader, out var userId) || string.IsNullOrWhiteSpace(userId))
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var claims = new List<Claim>
        {
            new("oid", userId.ToString()),
            new("tid", TenantId),
            new("name", Request.Headers[UserNameHeader].ToString())
        };

        if (Request.Headers.TryGetValue(ScopeHeader, out var scope) && !string.IsNullOrWhiteSpace(scope))
        {
            claims.Add(new Claim("scp", scope.ToString()));
        }

        var identity = new ClaimsIdentity(claims, SchemeName);
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
