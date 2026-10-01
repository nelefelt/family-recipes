using FamilyRecipes.Api.DTOs.Requests;
using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web.Resource;

namespace FamilyRecipes.Api.Controllers;

[ApiController]
[Authorize]
[RequiredScope("access_as_user")]
[Route("api/recipes")]
[Produces("application/json")]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
[ProducesResponseType(StatusCodes.Status403Forbidden)]
public class RecipesController(IRecipeService recipeService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<IReadOnlyList<RecipeResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<RecipeResponse>>> GetRecipes(CancellationToken cancellationToken)
    {
        var recipes = await recipeService.GetRecipesAsync(cancellationToken);
        return Ok(recipes);
    }

    [HttpGet("{recipeId:int}")]
    [ProducesResponseType<RecipeResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<RecipeResponse>> GetRecipeById(int recipeId, CancellationToken cancellationToken)
    {
        var recipe = await recipeService.GetRecipeByIdAsync(recipeId, cancellationToken);
        return Ok(recipe);
    }

    [HttpPost]
    [Consumes("application/json")]
    [ProducesResponseType<RecipeResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<RecipeResponse>> CreateRecipe(CreateRecipeRequest request, CancellationToken cancellationToken)
    {
        var recipe = await recipeService.CreateRecipeAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetRecipeById), new { recipeId = recipe.Id }, recipe);
    }

    [HttpDelete("{recipeId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteRecipe(int recipeId, CancellationToken cancellationToken)
    {
        await recipeService.DeleteRecipeAsync(recipeId, cancellationToken);

        return NoContent();
    }
}
