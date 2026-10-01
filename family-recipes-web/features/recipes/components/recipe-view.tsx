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
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-3">
        <h1 className="font-heading text-4xl leading-tight font-medium tracking-tight text-foreground">
          {recipe.title}
        </h1>
        {recipe.description ? (
          <p className="text-base leading-relaxed text-muted-foreground">{recipe.description}</p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {recipe.createdByUserName} · {createdAtFormatter.format(new Date(recipe.createdAt))}
        </p>
      </header>

      <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/50 sm:p-6">
        <div className="flex items-center gap-2.5">
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
              <span className="text-foreground">{ingredient.name}</span>
              <span className="shrink-0 text-muted-foreground">{formatQuantity(ingredient.amount, ingredient.unit)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border/50 sm:p-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-secondary/70 text-primary">
            <ListOrdered aria-hidden="true" className="size-[18px]" />
          </div>
          <h2 className="text-base font-bold text-foreground">Gör så här</h2>
        </div>
        <ol className="flex flex-col gap-4">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                {index + 1}
              </span>
              <p className="pt-0.5 text-foreground">{step}</p>
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
