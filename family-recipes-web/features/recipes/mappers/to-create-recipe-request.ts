import type { CreateRecipeFormValues } from "@/features/recipes/schemas/create-recipe-schema";
import type { CreateRecipeRequest } from "@/features/recipes/types/recipe";

export function toCreateRecipeRequest(values: CreateRecipeFormValues): CreateRecipeRequest {
  return {
    title: values.title.trim(),
    description: toNullableText(values.description),
    instructions: values.instructions.trim(),
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
