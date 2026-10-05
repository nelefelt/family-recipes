"use client";

import { useState } from "react";
import { toast } from "sonner";
import { RecipeForm } from "@/features/recipes/components/recipe-form";
import { useCreateRecipe } from "@/features/recipes/hooks/use-create-recipe";
import { toCreateRecipeRequest } from "@/features/recipes/mappers/to-recipe-request";
import { createEmptyRecipeFormValues } from "@/features/recipes/schemas/recipe-form-default-values";
import type { RecipeFormValues } from "@/features/recipes/schemas/recipe-form-schema";
import { toastTitleMaxLength, truncateText } from "@/lib/truncate-text";

export const CreateRecipeForm = () => {
  const createRecipeMutation = useCreateRecipe();
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = (values: RecipeFormValues) => {
    createRecipeMutation.mutate(toCreateRecipeRequest(values), {
      onSuccess: (recipe) => {
        setFormKey((key) => key + 1);
        toast.success("Receptet har skapats", {
          description: `"${truncateText(recipe.title, toastTitleMaxLength)}" finns nu bland familjens recept.`,
        });
      },
    });
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
