import { Leaf, ListOrdered } from "lucide-react";
import type { RecipeResponse } from "@/features/recipes/types/recipe";

interface RecipeViewProps {
  recipe: RecipeResponse;
}

const createdAtFormatter = new Intl.DateTimeFormat("sv-SE", { day: "numeric", month: "short", year: "numeric" });
const amountFormatter = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 2 });

export const RecipeView = ({ recipe }: RecipeViewProps) => {
  const steps = getInstructionSteps(recipe.instructions);

  return (
    <article className="flex min-w-0 flex-col gap-4">
      <header className="flex min-w-0 flex-col gap-3">
        <h1 className="font-heading text-4xl leading-tight font-medium tracking-tight wrap-anywhere text-foreground">
          {recipe.title}
        </h1>
        {recipe.description ? (
          <p className="text-[17px] leading-relaxed wrap-anywhere text-foreground/80">{recipe.description}</p>
        ) : null}
        <p className="flex items-center gap-2 text-sm font-medium text-foreground/70">
          <span
            aria-hidden="true"
            className="flex size-6 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary"
          >
            {recipe.createdByUserName.trim().charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 truncate">
            {recipe.createdByUserName} · {createdAtFormatter.format(new Date(recipe.createdAt))}
          </span>
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/50 sm:p-6">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-secondary/70 text-primary">
            <Leaf aria-hidden="true" className="size-[18px]" />
          </div>
          <h2 className="text-base font-bold text-foreground">Ingredienser</h2>
        </div>
        <ul className="flex flex-col">
          {recipe.ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex items-baseline justify-between gap-4 border-b border-border/60 py-3 text-sm last:border-b-0"
            >
              <span className="min-w-0 wrap-anywhere text-foreground">{ingredient.name}</span>
              <span className="max-w-[45%] text-right wrap-anywhere text-muted-foreground">
                {formatQuantity(ingredient.amount, ingredient.unit)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/50 sm:p-6">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-secondary/70 text-primary">
            <ListOrdered aria-hidden="true" className="size-[18px]" />
          </div>
          <h2 className="text-base font-bold text-foreground">Gör så här</h2>
        </div>
        <ol className="flex flex-col gap-5 pt-1">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3.5 text-sm leading-relaxed">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <p className="min-w-0 pt-1 wrap-anywhere text-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
};

function formatQuantity(amount: number | null, unit: string | null): string {
  const formattedAmount = amount === null ? null : amountFormatter.format(amount);
  const parts = [formattedAmount, unit].filter((part) => part !== null && part !== "");

  return parts.length > 0 ? parts.join(" ") : "–";
}

function getInstructionSteps(instructions: string): string[] {
  const steps = instructions
    .split(/\r?\n/)
    .map((step) => step.trim())
    .filter((step) => step.length > 0);

  return steps.length > 0 ? steps : [instructions];
}
