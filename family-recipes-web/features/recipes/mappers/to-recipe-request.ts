import { removeEmptyInstructionSteps } from "@/features/recipes/mappers/instruction-steps";
import type { RecipeFormValues } from "@/features/recipes/schemas/recipe-form-schema";
import type { CreateRecipeRequest, UpdateRecipeRequest } from "@/features/recipes/types/recipe";

export function toCreateRecipeRequest(values: RecipeFormValues): CreateRecipeRequest {
  return toRecipeRequest(values);
}

export function toUpdateRecipeRequest(values: RecipeFormValues): UpdateRecipeRequest {
  return toRecipeRequest(values);
}

function toRecipeRequest(values: RecipeFormValues) {
  return {
    title: values.title.trim(),
    description: toNullableText(values.description),
    instructions: removeEmptyInstructionSteps(values.instructions),
    ingredients: values.ingredients.map((ingredient) => ({
      name: ingredient.name.trim(),
      amount: toNullableAmount(ingredient.amount),
      unit: toNullableText(ingredient.unit),
    })),
  };
}

function toNullableText(value: string): string | null {
  const trimmedValue = value.trim();

  return trimmedValue === "" ? null : trimmedValue;
}

function toNullableAmount(value: string): number | null {
  const trimmedValue = value.trim();

  return trimmedValue === "" ? null : Number(trimmedValue.replace(",", "."));
}
