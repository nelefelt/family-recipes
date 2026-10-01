using FamilyRecipes.Api.DTOs.Requests;
using FamilyRecipes.Api.DTOs.Responses;

namespace FamilyRecipes.Api.Services;

public interface IRecipeService
{
    Task<IReadOnlyList<RecipeResponse>> GetRecipesAsync(CancellationToken cancellationToken);
    Task<RecipeResponse> GetRecipeByIdAsync(int id, CancellationToken cancellationToken);
    Task<RecipeResponse> CreateRecipeAsync(CreateRecipeRequest request, CancellationToken cancellationToken);
    Task DeleteRecipeAsync(int id, CancellationToken cancellationToken);
}
