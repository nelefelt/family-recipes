namespace FamilyRecipes.Api.DTOs.Requests;

public class CreateRecipeRequest
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Instructions { get; set; }
    public IReadOnlyList<CreateIngredientRequest> Ingredients { get; set; } = [];
}
