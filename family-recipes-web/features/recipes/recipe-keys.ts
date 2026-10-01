export const recipeKeys = {
  all: ["recipes"] as const,
  detail: (id: number) => ["recipes", "detail", id] as const,
};
