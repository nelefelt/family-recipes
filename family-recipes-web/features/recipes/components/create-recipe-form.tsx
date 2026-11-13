"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { RecipeRequestError } from "@/features/recipes/api/recipe-request-error";
import { RecipeForm } from "@/features/recipes/components/recipe-form";
import { RecipeFormPageHeader, SaveRecipeButton } from "@/features/recipes/components/recipe-form-page-header";
import { useCreateRecipe } from "@/features/recipes/hooks/use-create-recipe";
import { toCreateRecipeRequest } from "@/features/recipes/mappers/to-recipe-request";
import { createEmptyRecipeFormValues } from "@/features/recipes/schemas/recipe-form-default-values";
import type { RecipeFormValues } from "@/features/recipes/schemas/recipe-form-schema";
import { toastTitleMaxLength, truncateText } from "@/lib/truncate-text";

const formId = "create-recipe-form";

const createIdempotencyKey = () => crypto.randomUUID();

export const CreateRecipeForm = () => {
  const router = useRouter();
  const createRecipeMutation = useCreateRecipe();
  // One key per opened form. Retries after an error reuse it, so a save that reached the server before
  // the error returns the same recipe instead of creating a duplicate.
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);

  const handleSubmit = (values: RecipeFormValues) => {
    createRecipeMutation.mutate(
      { request: toCreateRecipeRequest(values), idempotencyKey },
      {
        onSuccess: (recipe) => {
          toast.success("Receptet har skapats", {
            description: `"${truncateText(recipe.title, toastTitleMaxLength)}" finns nu bland familjens recept.`,
          });
          router.replace("/");
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
    <>
      <RecipeFormPageHeader
        title="Nytt recept"
        backHref="/"
        backLabel="Tillbaka till recept"
        action={
          <SaveRecipeButton
            formId={formId}
            isPending={createRecipeMutation.isPending}
            // Stays disabled after success until the navigation to the start page has finished.
            disabled={createRecipeMutation.isSuccess}
          />
        }
      />
      <RecipeForm
        id={formId}
        defaultValues={createEmptyRecipeFormValues()}
        errorMessage={createRecipeMutation.error?.message}
        onSubmit={handleSubmit}
      />
    </>
  );
};
