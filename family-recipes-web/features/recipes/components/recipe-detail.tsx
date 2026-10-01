"use client";

import { CircleAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecipeRequestError } from "@/features/recipes/api/get-recipe";
import { RecipeView } from "@/features/recipes/components/recipe-view";
import { useRecipe } from "@/features/recipes/hooks/use-recipe";

interface RecipeDetailProps {
  recipeId: number;
}

export const RecipeDetail = ({ recipeId }: RecipeDetailProps) => {
  const { data: recipe, error, isPending, isRefetching, refetch } = useRecipe(recipeId);

  if (isPending) {
    return (
      <div aria-busy="true" className="flex flex-col gap-4">
        <span className="sr-only">Laddar recept...</span>
        <div aria-hidden="true" className="flex flex-col gap-3">
          <div className="h-10 w-2/3 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded-lg bg-muted" />
        </div>
        <div aria-hidden="true" className="h-48 animate-pulse rounded-3xl bg-card ring-1 ring-border/50" />
        <div aria-hidden="true" className="h-56 animate-pulse rounded-3xl bg-card ring-1 ring-border/50" />
      </div>
    );
  }

  if (error instanceof RecipeRequestError && error.status === 404) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-3xl bg-card px-6 py-10 shadow-sm ring-1 ring-border/50">
        <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground">Receptet finns inte</h1>
        <p className="text-sm text-muted-foreground">Det kan ha tagits bort, eller så är länken fel.</p>
        <Button asChild className="h-11 rounded-xl px-4">
          <Link href="/">Till recepten</Link>
        </Button>
      </div>
    );
  }

  if (error || recipe === undefined) {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-4 text-sm text-destructive"
      >
        <p className="flex items-start gap-2.5">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error?.message ?? "Receptet kunde inte hämtas. Försök igen."}
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

  return <RecipeView recipe={recipe} />;
};
