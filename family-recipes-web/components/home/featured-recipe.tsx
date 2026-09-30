import { Clock, Heart, UtensilsCrossed } from "lucide-react";
import type { PresentationRecipe } from "@/components/home/sample-recipes";

export function FeaturedRecipe({ recipe }: { recipe: PresentationRecipe }) {
  return (
    <section className="grid gap-6 rounded-2xl bg-secondary p-5 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:items-center md:gap-10 md:p-8 lg:p-10">
      <div className="relative flex min-h-56 items-center justify-center rounded-2xl bg-card md:min-h-80">
        <UtensilsCrossed aria-hidden="true" className="size-10 text-primary/40" />
        <button
          type="button"
          aria-label={`Favorit, ${recipe.title}`}
          className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
        >
          <Heart aria-hidden="true" className="size-4" />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-sm font-medium text-warm">Utvalt recept</p>
        <h2 className="text-4xl leading-tight font-medium tracking-tight text-foreground md:text-5xl">
          {recipe.title}
        </h2>
        <p className="max-w-md text-base leading-relaxed text-muted-foreground">{recipe.description}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{recipe.category}</span>
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden="true" className="size-4" />
            {recipe.cookTime}
          </span>
          <span>{recipe.creatorName}</span>
        </div>
      </div>
    </section>
  );
}
