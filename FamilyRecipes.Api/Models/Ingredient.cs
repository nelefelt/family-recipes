namespace FamilyRecipes.Api.Models;

public class Ingredient
{
    public int Id { get; set; }
    public int RecipeId { get; set; }
    public Recipe Recipe { get; set; } = null!;
    public required string Name { get; set; }
    public decimal? Amount { get; set; }
    public string? Unit { get; set; }
}
