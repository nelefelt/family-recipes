namespace FamilyRecipes.Api.DTOs.Responses;

public class IngredientResponse
{
    public required int Id { get; set; }
    public required string Name { get; set; }
    public required decimal? Amount { get; set; }
    public required string? Unit { get; set; }
}
