import { Leaf, UtensilsCrossed } from "lucide-react";
import type { RecipeResponse } from "@/features/recipes/types/recipe";

interface RecipeCardProps {
  recipe: RecipeResponse;
}

const createdAtFormatter = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short" });

export const RecipeCard = ({ recipe }: RecipeCardProps) => (
  <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/50 transition-shadow group-hover:shadow-md">
    <div className="flex aspect-[16/9] items-center justify-center bg-secondary/70">
      <UtensilsCrossed aria-hidden="true" className="size-8 text-primary/40" />
    </div>
    <div className="flex min-w-0 flex-1 flex-col gap-2 p-5">
      <h3
        id={`recipe-title-${recipe.id}`}
        className="line-clamp-2 font-heading text-2xl leading-tight font-medium tracking-tight wrap-anywhere text-foreground"
      >
        {recipe.title}
      </h3>
      {recipe.description ? (
        <p className="line-clamp-2 text-[15px] leading-relaxed wrap-anywhere text-foreground/80">
          {recipe.description}
        </p>
      ) : null}
      <div className="mt-auto flex items-center justify-between gap-3 pt-3 text-[13px] font-medium text-foreground/70">
        <span className="truncate">
          {recipe.createdByUserName} · {createdAtFormatter.format(new Date(recipe.createdAt))}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1">
          <Leaf aria-hidden="true" className="size-3.5 text-primary" />
          {recipe.ingredients.length} {recipe.ingredients.length === 1 ? "ingrediens" : "ingredienser"}
        </span>
      </div>
    </div>
  </article>
);
