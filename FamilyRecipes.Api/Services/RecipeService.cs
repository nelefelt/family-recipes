using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.Exceptions;
using FamilyRecipes.Api.Mappers;
using FamilyRecipes.Api.Repositories;

namespace FamilyRecipes.Api.Services;

public class RecipeService(IRecipeRepository recipeRepository) : IRecipeService
{
    public async Task<IReadOnlyList<RecipeResponse>> GetRecipesAsync(CancellationToken cancellationToken)
    {
        var recipes = await recipeRepository.GetAllAsync(cancellationToken);

        return recipes
            .Select(recipe => recipe.ToResponse())
            .ToList();
    }

    public async Task<RecipeResponse> GetRecipeByIdAsync(int id, CancellationToken cancellationToken)
    {
        var recipe = await recipeRepository.GetByIdAsync(id, cancellationToken);

        if (recipe is null)
        {
            throw new RecipeNotFoundException(id);
        }

        return recipe.ToResponse();
    }
}
