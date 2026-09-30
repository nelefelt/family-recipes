using FamilyRecipes.Api.DTOs.Requests;
using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.Exceptions;
using FamilyRecipes.Api.Mappers;
using FamilyRecipes.Api.Models;
using FamilyRecipes.Api.Repositories;

namespace FamilyRecipes.Api.Services;

public class RecipeService(
    IRecipeRepository recipeRepository,
    IUserService userService) : IRecipeService
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

    public async Task<RecipeResponse> CreateRecipeAsync(CreateRecipeRequest request, CancellationToken cancellationToken)
    {
        var user = await userService.GetOrCreateCurrentAsync(cancellationToken);
        var now = DateTime.UtcNow;
        var recipe = new Recipe
        {
            Title = request.Title,
            Description = request.Description,
            Instructions = request.Instructions,
            CreatedByUserId = user.Id,
            CreatedByUser = user,
            CreatedAt = now,
            UpdatedAt = now,
            Ingredients = request.Ingredients
                .Select(ingredient => new Ingredient
                {
                    Name = ingredient.Name,
                    Amount = ingredient.Amount,
                    Unit = ingredient.Unit
                })
                .ToList()
        };

        await recipeRepository.AddAsync(recipe, cancellationToken);
        await recipeRepository.SaveChangesAsync(cancellationToken);

        return recipe.ToResponse();
    }
}
