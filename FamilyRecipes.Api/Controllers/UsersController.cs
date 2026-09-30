using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;

namespace FamilyRecipes.Api.Controllers;

[ApiController]
[Authorize]
[RequiredScope("access_as_user")]
[Route("api/users")]
[Produces("application/json")]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public class UsersController(IUserService userService) : ControllerBase
{
    [HttpPut("me")]
    [ProducesResponseType<UserResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<UserResponse>> PutCurrentUser(CancellationToken cancellationToken)
    {
        var user = await userService.GetOrCreateCurrentAsync(cancellationToken);

        return Ok(new UserResponse(user.Id, user.Name));
    }
}
