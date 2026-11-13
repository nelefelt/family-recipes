"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RecipeRequestError } from "@/features/recipes/api/recipe-request-error";
import { RecipeForm } from "@/features/recipes/components/recipe-form";
import { useCreateRecipe } from "@/features/recipes/hooks/use-create-recipe";
import { toCreateRecipeRequest } from "@/features/recipes/mappers/to-recipe-request";
import { createEmptyRecipeFormValues } from "@/features/recipes/schemas/recipe-form-default-values";
import type { RecipeFormValues } from "@/features/recipes/schemas/recipe-form-schema";
import { toastTitleMaxLength, truncateText } from "@/lib/truncate-text";

const createIdempotencyKey = () => crypto.randomUUID();

export const CreateRecipeForm = () => {
  const createRecipeMutation = useCreateRecipe();
  const [formKey, setFormKey] = useState(0);
  // One key per recipe the user is trying to create. Retries after an error reuse it, so a save that
  // reached the server before the error returns the same recipe instead of creating a duplicate.
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);

  const handleSubmit = (values: RecipeFormValues) => {
    createRecipeMutation.mutate(
      { request: toCreateRecipeRequest(values), idempotencyKey },
      {
        onSuccess: (recipe) => {
          setIdempotencyKey(createIdempotencyKey());
          setFormKey((key) => key + 1);
          toast.success("Receptet har skapats", {
            description: `"${truncateText(recipe.title, toastTitleMaxLength)}" finns nu bland familjens recept.`,
          });
        },
        onError: (error) => {
          // 422: the key was already used with other content. A new key lets the next save go through.
          if (error instanceof RecipeRequestError && error.status === 422) {
            setIdempotencyKey(createIdempotencyKey());
          }
        },
      },
    );
  };

  return (
    <RecipeForm
      key={formKey}
      defaultValues={createEmptyRecipeFormValues()}
      submitLabel="Skapa recept"
      pendingLabel="Skapar recept..."
      isPending={createRecipeMutation.isPending}
      errorMessage={createRecipeMutation.error?.message}
      onSubmit={handleSubmit}
    />
  );
};
