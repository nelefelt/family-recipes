import { removeEmptyInstructionSteps } from "@/features/recipes/mappers/instruction-steps";
import type { RecipeFormValues } from "@/features/recipes/schemas/recipe-form-schema";
import type { RecipeResponse } from "@/features/recipes/types/recipe";

export function toRecipeFormValues(recipe: RecipeResponse): RecipeFormValues {
  return {
    title: recipe.title,
    description: recipe.description ?? "",
    instructions: removeEmptyInstructionSteps(recipe.instructions),
    ingredients: recipe.ingredients.map((ingredient) => ({
      amount: ingredient.amount === null ? "" : String(ingredient.amount).replace(".", ","),
      unit: ingredient.unit ?? "",
      name: ingredient.name,
    })),
  };
}
