import { z } from "zod";

const positiveDecimalPattern = /^\d+([.,]\d+)?$/;

const isPositiveDecimal = (value: string) => {
  if (!positiveDecimalPattern.test(value)) {
    return false;
  }

  return Number(value.replace(",", ".")) > 0;
};

const ingredientSchema = z.object({
  amount: z.string().trim().refine((value) => value === "" || isPositiveDecimal(value), "Ange en giltig mängd."),
  unit: z.string().trim().max(50, "Enheten får vara högst 50 tecken."),
  name: z.string().trim().min(1, "Ange en ingrediens.").max(200, "Ingrediensen får vara högst 200 tecken."),
});

export const createRecipeSchema = z.object({
  title: z.string().trim().min(1, "Ange en titel.").max(200, "Titeln får vara högst 200 tecken."),
  description: z.string().trim().max(2000, "Beskrivningen får vara högst 2 000 tecken."),
  instructions: z
    .string()
    .trim()
    .min(1, "Ange instruktioner.")
    .max(10000, "Instruktionerna får vara högst 10 000 tecken."),
  ingredients: z.array(ingredientSchema).min(1, "Lägg till minst en ingrediens."),
});

export type CreateRecipeFormValues = z.infer<typeof createRecipeSchema>;
