namespace FamilyRecipes.Api.DTOs.Responses;

public class IngredientResponse
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public decimal? Amount { get; set; }
    public string? Unit { get; set; }
}
