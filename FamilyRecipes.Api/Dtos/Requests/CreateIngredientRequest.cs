namespace FamilyRecipes.Api.DTOs.Requests;

public class CreateIngredientRequest
{
    public required string Name { get; set; }
    public decimal? Amount { get; set; }
    public string? Unit { get; set; }
}
