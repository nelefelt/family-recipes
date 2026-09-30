/** Temporary layout samples. Not loaded from the API. */
export interface PresentationRecipe {
  id: string;
  title: string;
  category: string;
  cookTime: string;
  creatorName: string;
  description?: string;
}

export const featuredRecipe: PresentationRecipe = {
  id: "lasagne",
  title: "Lasagne",
  category: "Middag",
  cookTime: "1 tim 15 min",
  creatorName: "Andreas",
  description:
    "En klassisk lasagne med köttfärssås, béchamel och ost. Ett recept som brukar samla hela familjen.",
};

export const recentRecipes: PresentationRecipe[] = [
  {
    id: "pannkakor",
    title: "Pannkakor",
    category: "Snabbt",
    cookTime: "25 min",
    creatorName: "Andreas",
  },
  {
    id: "kanelbullar",
    title: "Kanelbullar",
    category: "Bakning",
    cookTime: "2 tim",
    creatorName: "Elsa",
  },
  {
    id: "chokladmousse",
    title: "Chokladmousse",
    category: "Dessert",
    cookTime: "20 min",
    creatorName: "Andreas",
  },
];

export const recipeCategories = ["Alla", "Middag", "Bakning", "Dessert", "Snabbt"] as const;
