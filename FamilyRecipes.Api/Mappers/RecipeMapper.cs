using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.Models;

namespace FamilyRecipes.Api.Mappers;

public static class RecipeMapper
{
    public static RecipeResponse ToResponse(this Recipe recipe)
    {
        return new RecipeResponse
        {
            Id = recipe.Id,
            Title = recipe.Title,
            Description = recipe.Description,
            Instructions = recipe.Instructions,
            CreatedByUserId = recipe.CreatedByUserId,
            CreatedByUserName = recipe.CreatedByUser.Name,
            CreatedAt = recipe.CreatedAt,
            UpdatedAt = recipe.UpdatedAt,
            Ingredients = recipe.Ingredients.Select(ingredient => ingredient.ToResponse()).ToList()
        };
    }

    public static IngredientResponse ToResponse(this Ingredient ingredient)
    {
        return new IngredientResponse
        {
            Id = ingredient.Id,
            Name = ingredient.Name,
            Amount = ingredient.Amount,
            Unit = ingredient.Unit
        };
    }
}
