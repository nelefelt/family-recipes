using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;

namespace FamilyRecipes.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController(IUserService userService) : ControllerBase
{
    [Authorize]
    [RequiredScope("access_as_user")]
    [HttpPut("me")]
    public async Task<ActionResult<UserResponse>> PutCurrentUser(CancellationToken cancellationToken)
    {
        var user = await userService.GetOrCreateCurrentAsync(cancellationToken);

        return Ok(new UserResponse(user.Id, user.Name));
    }
}
