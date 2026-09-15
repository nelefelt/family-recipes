using FamilyRecipes.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyRecipes.Api.Data.Configurations;

public class IngredientConfiguration : IEntityTypeConfiguration<Ingredient>
{
    public void Configure(EntityTypeBuilder<Ingredient> builder)
    {
        builder.Property(ingredient => ingredient.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ingredient => ingredient.Amount)
            .HasPrecision(10, 2);

        builder.Property(ingredient => ingredient.Unit)
            .HasMaxLength(50);

        builder.HasOne(ingredient => ingredient.Recipe)
            .WithMany(recipe => recipe.Ingredients)
            .HasForeignKey(ingredient => ingredient.RecipeId);
    }
}
