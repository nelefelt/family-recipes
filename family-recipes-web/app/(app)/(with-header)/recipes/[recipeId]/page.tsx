import { notFound } from "next/navigation";
import { RecipeDetail } from "@/features/recipes/components/recipe-detail";

interface RecipePageProps {
  params: Promise<{ recipeId: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { recipeId } = await params;
  const id = Number(recipeId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 md:px-6 md:py-10">
      <RecipeDetail recipeId={id} />
    </main>
  );
}
