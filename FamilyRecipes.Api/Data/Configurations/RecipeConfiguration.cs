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

        builder.Property(recipe => recipe.RowVersion)
            .IsRowVersion();

        // SHA-256 of the create request.
        builder.Property(recipe => recipe.IdempotencyRequestHash)
            .HasMaxLength(32);

        // One recipe per create attempt. Recipes created without a key are not affected.
        builder
            .HasIndex(recipe => new
            {
                recipe.CreatedByUserId,
                recipe.IdempotencyKey
            })
            .IsUnique()
            .HasFilter("[IdempotencyKey] IS NOT NULL");

        // Kept explicitly: EF would otherwise treat the filtered index above as covering this foreign key,
        // but it leaves out every recipe without a key.
        builder.HasIndex(recipe => recipe.CreatedByUserId);

        builder.HasOne(recipe => recipe.CreatedByUser)
            .WithMany(user => user.Recipes)
            .HasForeignKey(recipe => recipe.CreatedByUserId);
    }
}
