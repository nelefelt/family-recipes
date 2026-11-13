namespace FamilyRecipes.Api.Exceptions;

public class RecipeConflictException(int recipeId)
    : Exception($"Recipe with id {recipeId} has been changed since it was loaded.")
{
    public int RecipeId { get; } = recipeId;
}
