import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 md:py-10">
      <Link
        href="/"
        className="inline-flex h-11 items-center gap-1.5 self-start rounded-full pr-3 pl-2.5 text-sm font-medium text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/40"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Alla recept
      </Link>
      <RecipeDetail recipeId={id} />
    </main>
  );
}
