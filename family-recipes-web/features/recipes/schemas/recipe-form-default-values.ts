import type { RecipeFormValues } from "@/features/recipes/schemas/recipe-form-schema";

export function createEmptyIngredient(): RecipeFormValues["ingredients"][number] {
  return {
    amount: "",
    unit: "",
    name: "",
  };
}

export function createEmptyRecipeFormValues(): RecipeFormValues {
  return {
    title: "",
    description: "",
    instructions: "",
    ingredients: [createEmptyIngredient()],
  };
}
