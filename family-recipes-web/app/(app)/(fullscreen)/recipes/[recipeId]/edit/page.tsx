import { notFound } from "next/navigation";
import { EditRecipeForm } from "@/features/recipes/components/edit-recipe-form";

interface EditRecipePageProps {
  params: Promise<{ recipeId: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { recipeId } = await params;
  const id = Number(recipeId);

  if (!Number.isSafeInteger(id) || id <= 0) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full min-w-0 max-w-lg flex-1 flex-col px-4 pb-10 sm:px-6 sm:pb-16">
      <EditRecipeForm recipeId={id} />
    </main>
  );
}
