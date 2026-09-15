using FamilyRecipes.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FamilyRecipes.Api.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(user => user.ExternalUserId)
            .IsRequired()
            .HasMaxLength(200);

        builder.HasIndex(user => user.ExternalUserId)
            .IsUnique();

        builder.Property(user => user.Name)
            .IsRequired()
            .HasMaxLength(100);
    }
}
