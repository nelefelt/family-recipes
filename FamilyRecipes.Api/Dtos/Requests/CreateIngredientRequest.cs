using System.ComponentModel.DataAnnotations;

namespace FamilyRecipes.Api.DTOs.Requests;

public class CreateIngredientRequest
{
    [Required]
    [MaxLength(200)]
    public required string Name { get; set; }

    [Range(typeof(decimal), "0.01", "99999999.99", ParseLimitsInInvariantCulture = true)]
    public decimal? Amount { get; set; }

    [MaxLength(50)]
    public string? Unit { get; set; }
}
