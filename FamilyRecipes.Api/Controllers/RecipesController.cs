using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace FamilyRecipes.Api.Controllers;

[ApiController]
[Route("api/recipes")]
public class RecipesController(IRecipeService recipeService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<RecipeResponse>>> GetRecipes(CancellationToken cancellationToken)
    {
        var recipes = await recipeService.GetRecipesAsync(cancellationToken);
        return Ok(recipes);
    }

    [HttpGet("{recipeId:int}")]
    public async Task<ActionResult<RecipeResponse>> GetRecipeById(int recipeId, CancellationToken cancellationToken)
    {
        var recipe = await recipeService.GetRecipeByIdAsync(recipeId, cancellationToken);
        return Ok(recipe);
    }
}
