namespace FamilyRecipes.Api.Exceptions;

public class RecipeForbiddenException(int recipeId)
    : Exception($"The current user is not allowed to modify recipe {recipeId}.")
{
    public int RecipeId { get; } = recipeId;
}
