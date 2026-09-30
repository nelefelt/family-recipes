namespace FamilyRecipes.Api.DTOs.Responses;

public class RecipeResponse
{
    public required int Id { get; set; }
    public required string Title { get; set; }
    public required string? Description { get; set; }
    public required string Instructions { get; set; }
    public required int CreatedByUserId { get; set; }
    public required string CreatedByUserName { get; set; }
    public required DateTime CreatedAt { get; set; }
    public required DateTime UpdatedAt { get; set; }
    public required IReadOnlyList<IngredientResponse> Ingredients { get; set; }
}
