using FamilyRecipes.Api.DTOs.Requests;
using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.Exceptions;
using FamilyRecipes.Api.Mappers;
using FamilyRecipes.Api.Models;
using FamilyRecipes.Api.Repositories;

namespace FamilyRecipes.Api.Services;

public class RecipeService(
    IRecipeRepository recipeRepository,
    IUserService userService,
    TimeProvider timeProvider) : IRecipeService
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

    public async Task DeleteRecipeAsync(int id, CancellationToken cancellationToken)
    {
        var recipe = await recipeRepository.GetByIdForUpdateAsync(id, cancellationToken);

        if (recipe is null)
        {
            throw new RecipeNotFoundException(id);
        }

        var currentUser = await userService.GetOrCreateCurrentAsync(cancellationToken);

        if (recipe.CreatedByUserId != currentUser.Id)
        {
            throw new RecipeForbiddenException(id);
        }

        recipeRepository.Delete(recipe);
        await recipeRepository.SaveChangesAsync(cancellationToken);
    }

    public async Task<RecipeResponse> CreateRecipeAsync(CreateRecipeRequest request, CancellationToken cancellationToken)
    {
        var user = await userService.GetOrCreateCurrentAsync(cancellationToken);
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var recipe = new Recipe
        {
            Title = request.Title,
            Description = request.Description,
            Instructions = request.Instructions,
            CreatedByUserId = user.Id,
            CreatedByUser = user,
            CreatedAt = now,
            UpdatedAt = now,
            Ingredients = ToIngredients(request.Ingredients)
        };

        await recipeRepository.AddAsync(recipe, cancellationToken);
        await recipeRepository.SaveChangesAsync(cancellationToken);

        return recipe.ToResponse();
    }

    public async Task<RecipeResponse> UpdateRecipeAsync(int id, UpdateRecipeRequest request, CancellationToken cancellationToken)
    {
        var recipe = await recipeRepository.GetByIdForUpdateAsync(id, cancellationToken);

        if (recipe is null)
        {
            throw new RecipeNotFoundException(id);
        }

        var currentUser = await userService.GetOrCreateCurrentAsync(cancellationToken);

        if (recipe.CreatedByUserId != currentUser.Id)
        {
            throw new RecipeForbiddenException(id);
        }

        recipe.Title = request.Title;
        recipe.Description = request.Description;
        recipe.Instructions = request.Instructions;
        recipe.UpdatedAt = timeProvider.GetUtcNow().UtcDateTime;
        recipe.CreatedByUser = currentUser;
        recipe.Ingredients.Clear();

        foreach (var ingredient in ToIngredients(request.Ingredients))
        {
            recipe.Ingredients.Add(ingredient);
        }

        await recipeRepository.SaveChangesAsync(cancellationToken);

        return recipe.ToResponse();
    }

    private static List<Ingredient> ToIngredients(IReadOnlyList<IngredientRequest> ingredients)
    {
        return ingredients
            .Select(ingredient => new Ingredient
            {
                Name = ingredient.Name,
                Amount = ingredient.Amount,
                Unit = ingredient.Unit
            })
            .ToList();
    }
}
