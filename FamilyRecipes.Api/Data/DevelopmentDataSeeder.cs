using FamilyRecipes.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FamilyRecipes.Api.Data;

public static class DevelopmentDataSeeder
{
    private const string SeedExternalUserId = "dev-user-andreas";

    public static async Task SeedAsync(AppDbContext dbContext, CancellationToken cancellationToken)
    {
        var seedUserExists = await dbContext.Users
            .AnyAsync(user => user.ExternalUserId == SeedExternalUserId, cancellationToken);

        if (seedUserExists)
        {
            return;
        }

        var user = new User
        {
            ExternalTenantId = "development",
            ExternalUserId = SeedExternalUserId,
            Name = "Andreas"
        };

        var lasagneCreatedAt = new DateTime(2026, 2, 8, 14, 30, 0, DateTimeKind.Utc);
        var pancakesCreatedAt = new DateTime(2026, 3, 2, 9, 15, 0, DateTimeKind.Utc);

        var lasagne = new Recipe
        {
            Title = "Lasagne",
            Description = "Classic layered pasta with meat sauce, béchamel and cheese.",
            Instructions = "Brown the minced beef. Stir in tomato sauce and simmer. Layer lasagne sheets, meat sauce, béchamel and cheese. Bake at 200°C for 35 minutes.",
            CreatedByUser = user,
            CreatedAt = lasagneCreatedAt,
            UpdatedAt = lasagneCreatedAt.AddHours(2),
            Ingredients =
            [
                new Ingredient { Name = "Lasagne sheets", Amount = 12, Unit = "pcs" },
                new Ingredient { Name = "Minced beef", Amount = 500, Unit = "g" },
                new Ingredient { Name = "Tomato sauce", Amount = 400, Unit = "ml" },
                new Ingredient { Name = "Béchamel sauce", Amount = 500, Unit = "ml" },
                new Ingredient { Name = "Grated cheese", Amount = 150, Unit = "g" }
            ]
        };

        var pancakes = new Recipe
        {
            Title = "Pancakes",
            Description = "Thin Swedish-style pancakes for a weekend breakfast.",
            Instructions = "Whisk flour, milk, eggs and salt until smooth. Melt butter in a pan and fry thin pancakes until golden on both sides.",
            CreatedByUser = user,
            CreatedAt = pancakesCreatedAt,
            UpdatedAt = pancakesCreatedAt,
            Ingredients =
            [
                new Ingredient { Name = "Flour", Amount = 2, Unit = "dl" },
                new Ingredient { Name = "Milk", Amount = 4, Unit = "dl" },
                new Ingredient { Name = "Eggs", Amount = 3, Unit = "pcs" },
                new Ingredient { Name = "Butter", Amount = 25, Unit = "g" },
                new Ingredient { Name = "Salt", Amount = 0.5m, Unit = "tsp" }
            ]
        };

        await dbContext.Users.AddAsync(user, cancellationToken);
        await dbContext.Recipes.AddRangeAsync([lasagne, pancakes], cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
