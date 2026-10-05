import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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
      <div className="relative mb-5 flex h-14 items-center">
        <Link
          href={`/recipes/${id}`}
          aria-label="Tillbaka till receptet"
          className="relative z-10 flex size-11 items-center justify-center rounded-full text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <ArrowLeft aria-hidden="true" className="size-5" />
        </Link>
        <h1 className="pointer-events-none absolute inset-x-0 text-center font-heading text-xl font-medium tracking-tight text-foreground">
          Redigera recept
        </h1>
      </div>
      <EditRecipeForm recipeId={id} />
    </main>
  );
}
