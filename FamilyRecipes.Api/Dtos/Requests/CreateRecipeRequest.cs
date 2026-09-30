using System.ComponentModel.DataAnnotations;

namespace FamilyRecipes.Api.DTOs.Requests;

public class CreateRecipeRequest
{
    [Required]
    [MaxLength(200)]
    public required string Title { get; set; }

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Required]
    [MaxLength(10000)]
    public required string Instructions { get; set; }

    [Required]
    [MinLength(1)]
    public required IReadOnlyList<CreateIngredientRequest> Ingredients { get; set; }
}
