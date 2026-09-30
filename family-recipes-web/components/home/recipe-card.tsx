import { Clock, Heart, UtensilsCrossed } from "lucide-react";
import type { PresentationRecipe } from "@/components/home/sample-recipes";

export function RecipeCard({ recipe }: { recipe: PresentationRecipe }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(32,37,31,0.04),0_10px_28px_rgba(32,37,31,0.04)]">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-secondary">
        <UtensilsCrossed aria-hidden="true" className="size-8 text-primary/50" />
        <button
          type="button"
          aria-label={`Favorit, ${recipe.title}`}
          className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <Heart aria-hidden="true" className="size-4" />
        </button>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>{recipe.category}</span>
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden="true" className="size-3.5" />
            {recipe.cookTime}
          </span>
        </div>
        <h3 className="text-2xl leading-tight font-medium tracking-tight text-foreground">
          {recipe.title}
        </h3>
        <p className="text-sm text-muted-foreground">{recipe.creatorName}</p>
      </div>
    </article>
  );
}
