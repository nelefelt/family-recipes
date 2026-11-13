using System.Security.Cryptography;
using System.Text.Json;
using FamilyRecipes.Api.Data;
using FamilyRecipes.Api.DTOs.Requests;
using FamilyRecipes.Api.DTOs.Responses;
using FamilyRecipes.Api.Exceptions;
using FamilyRecipes.Api.Mappers;
using FamilyRecipes.Api.Models;
using FamilyRecipes.Api.Repositories;
using Microsoft.EntityFrameworkCore;

namespace FamilyRecipes.Api.Services;

public class RecipeService(
    IRecipeRepository recipeRepository,
    IUserService userService,
    TimeProvider timeProvider) : IRecipeService
{
    public async Task<IReadOnlyList<RecipeResponse>> GetRecipesAsync(CancellationToken cancellationToken)
    {
        var recipes = await recipeRepository.GetAllAsync(cancellationToken);

        return recipes
            .Select(recipe => recipe.ToResponse())
            .ToList();
    }

    public async Task<RecipeResponse> GetRecipeByIdAsync(int id, CancellationToken cancellationToken)
    {
        var recipe = await recipeRepository.GetByIdAsync(id, cancellationToken);

        if (recipe is null)
        {
            throw new RecipeNotFoundException(id);
        }

        return recipe.ToResponse();
    }

    public async Task DeleteRecipeAsync(int id, CancellationToken cancellationToken)
    {
        var recipe = await recipeRepository.GetByIdAsync(id, cancellationToken);

        if (recipe is null)
        {
            throw new RecipeNotFoundException(id);
        }

        var currentUser = await userService.GetOrCreateCurrentAsync(cancellationToken);

        if (recipe.CreatedByUserId != currentUser.Id)
        {
            throw new RecipeForbiddenException(id);
        }

        var deletedCount = await recipeRepository.DeleteOwnedAsync(id, currentUser.Id, cancellationToken);

        // Another request deleted the recipe after our read.
        if (deletedCount == 0)
        {
            throw new RecipeNotFoundException(id);
        }
    }

    public async Task<RecipeResponse> CreateRecipeAsync(
        CreateRecipeRequest request,
        Guid? idempotencyKey,
        CancellationToken cancellationToken)
    {
        var user = await userService.GetOrCreateCurrentAsync(cancellationToken);
        byte[]? requestHash = null;

        if (idempotencyKey is Guid key)
        {
            requestHash = ComputeRequestHash(request);
            var existingRecipe = await recipeRepository.GetByIdempotencyKeyAsync(user.Id, key, cancellationToken);

            if (existingRecipe is not null)
            {
                return ReturnExistingOrThrow(existingRecipe, key, requestHash);
            }
        }

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var recipe = new Recipe
        {
            Title = request.Title,
            Description = request.Description,
            Instructions = request.Instructions,
            CreatedByUserId = user.Id,
            CreatedByUser = user,
            CreatedAt = now,
            UpdatedAt = now,
            Ingredients = ToIngredients(request.Ingredients),
            IdempotencyKey = idempotencyKey,
            IdempotencyRequestHash = requestHash
        };

        await recipeRepository.AddAsync(recipe, cancellationToken);

        try
        {
            await recipeRepository.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException exception) when (
            idempotencyKey is Guid conflictingKey &&
            requestHash is not null &&
            exception.IsUniqueConstraintViolation())
        {
            // A concurrent request with the same key saved first. The unique index kept it to one recipe.
            recipeRepository.Detach(recipe);

            var concurrentlyCreatedRecipe = await recipeRepository.GetByIdempotencyKeyAsync(
                user.Id,
                conflictingKey,
                cancellationToken);

            if (concurrentlyCreatedRecipe is null)
            {
                throw;
            }

            return ReturnExistingOrThrow(concurrentlyCreatedRecipe, conflictingKey, requestHash);
        }

        return recipe.ToResponse();
    }

    // Both paths, the direct lookup and the one after a unique violation, end here, so the same key with
    // different content is always rejected.
    private static RecipeResponse ReturnExistingOrThrow(Recipe existingRecipe, Guid idempotencyKey, byte[] requestHash)
    {
        if (existingRecipe.IdempotencyRequestHash is null ||
            !existingRecipe.IdempotencyRequestHash.AsSpan().SequenceEqual(requestHash))
        {
            throw new IdempotencyKeyReusedException(idempotencyKey);
        }

        return existingRecipe.ToResponse();
    }

    private static byte[] ComputeRequestHash(CreateRecipeRequest request)
    {
        return SHA256.HashData(JsonSerializer.SerializeToUtf8Bytes(request));
    }

    public async Task<RecipeResponse> UpdateRecipeAsync(int id, UpdateRecipeRequest request, CancellationToken cancellationToken)
    {
        var recipe = await recipeRepository.GetByIdForUpdateAsync(id, cancellationToken);

        if (recipe is null)
        {
            throw new RecipeNotFoundException(id);
        }

        var currentUser = await userService.GetOrCreateCurrentAsync(cancellationToken);

        if (recipe.CreatedByUserId != currentUser.Id)
        {
            throw new RecipeForbiddenException(id);
        }

        if (!recipe.RowVersion.AsSpan().SequenceEqual(request.Version))
        {
            throw new RecipeConflictException(id);
        }

        recipe.Title = request.Title;
        recipe.Description = request.Description;
        recipe.Instructions = request.Instructions;
        recipe.UpdatedAt = timeProvider.GetUtcNow().UtcDateTime;
        recipe.CreatedByUser = currentUser;
        recipe.Ingredients.Clear();

        foreach (var ingredient in ToIngredients(request.Ingredients))
        {
            recipe.Ingredients.Add(ingredient);
        }

        recipeRepository.PrepareConcurrencyCheck(recipe, request.Version);

        try
        {
            await recipeRepository.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new RecipeConflictException(id);
        }

        return recipe.ToResponse();
    }

    private static List<Ingredient> ToIngredients(IReadOnlyList<IngredientRequest> ingredients)
    {
        return ingredients
            .Select(ingredient => new Ingredient
            {
                Name = ingredient.Name,
                Amount = ingredient.Amount,
                Unit = ingredient.Unit
            })
            .ToList();
    }
}
