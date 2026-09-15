namespace FamilyRecipes.Api.Exceptions;

public class RecipeNotFoundException(int recipeId)
    : Exception($"Recipe with id {recipeId} was not found.")
{
    public int RecipeId { get; } = recipeId;
}
