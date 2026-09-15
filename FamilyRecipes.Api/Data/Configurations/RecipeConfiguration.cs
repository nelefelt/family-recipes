using FamilyRecipes.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyRecipes.Api.Data.Configurations;

public class RecipeConfiguration : IEntityTypeConfiguration<Recipe>
{
    public void Configure(EntityTypeBuilder<Recipe> builder)
    {
        builder.Property(recipe => recipe.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(recipe => recipe.Description)
            .HasMaxLength(2000);

        builder.Property(recipe => recipe.Instructions)
            .IsRequired()
            .HasMaxLength(10000);

        builder.Property(recipe => recipe.CreatedAt)
            .IsRequired();

        builder.Property(recipe => recipe.UpdatedAt)
            .IsRequired();

        builder.HasOne(recipe => recipe.CreatedByUser)
            .WithMany(user => user.Recipes)
            .HasForeignKey(recipe => recipe.CreatedByUserId);
    }
}
