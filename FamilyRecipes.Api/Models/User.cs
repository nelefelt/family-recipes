namespace FamilyRecipes.Api.Models;

public class User
{
    public int Id { get; set; }
    public required string ExternalTenantId { get; set; }
    public required string ExternalUserId { get; set; }
    public required string Name { get; set; }
    public ICollection<Recipe> Recipes { get; set; } = [];
}
