namespace FamilyRecipes.Api.DTOs.Responses;

public class RecipeResponse
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string Instructions { get; set; }
    public int CreatedByUserId { get; set; }
    public required string CreatedByUserName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public IReadOnlyList<IngredientResponse> Ingredients { get; set; } = [];
}
