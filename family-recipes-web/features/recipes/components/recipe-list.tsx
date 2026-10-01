"use client";

import { ChefHat, CircleAlert, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/features/recipes/components/recipe-card";
import { useRecipes } from "@/features/recipes/hooks/use-recipes";

const skeletonCount = 3;
const gridClassName = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

export const RecipeList = () => {
  const { data: recipes, error, isPending, isRefetching, refetch } = useRecipes();

  if (isPending) {
    return (
      <div aria-busy="true" className={gridClassName}>
        <span className="sr-only">Laddar recept...</span>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/50"
          >
            <div className="aspect-[16/9] animate-pulse bg-secondary/70" />
            <div className="flex flex-col gap-3 p-5">
              <div className="h-6 w-2/3 animate-pulse rounded-lg bg-muted" />
              <div className="h-4 w-full animate-pulse rounded-lg bg-muted" />
              <div className="h-3 w-1/2 animate-pulse rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-4 text-sm text-destructive"
      >
        <p className="flex items-start gap-2.5">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error.message}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => void refetch()}
          disabled={isRefetching}
          className="h-10 rounded-xl px-4"
        >
          Försök igen
        </Button>
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-card px-6 py-12 text-center shadow-sm ring-1 ring-border/50">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
          <ChefHat aria-hidden="true" className="size-7" />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-heading text-2xl font-medium tracking-tight text-foreground">Inga recept än</h3>
          <p className="text-sm text-muted-foreground">Lägg till familjens första recept.</p>
        </div>
        <Button asChild className="h-12 rounded-2xl px-5 text-base font-semibold">
          <Link href="/recipes/new">
            <Plus aria-hidden="true" />
            Nytt recept
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className={gridClassName}>
      {recipes.map((recipe) => (
        <li key={recipe.id}>
          <Link
            href={`/recipes/${recipe.id}`}
            aria-labelledby={`recipe-title-${recipe.id}`}
            className="group block h-full rounded-3xl outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
          >
            <RecipeCard recipe={recipe} />
          </Link>
        </li>
      ))}
    </ul>
  );
};
