import { Search } from "lucide-react";
import { FeaturedRecipe } from "@/components/home/featured-recipe";
import { HomeGreeting } from "@/components/home/home-greeting";
import { RecipeCard } from "@/components/home/recipe-card";
import { featuredRecipe, recentRecipes, recipeCategories } from "@/components/home/sample-recipes";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-8 md:gap-14 md:px-6 md:py-12">
      <section className="flex flex-col gap-6">
        <HomeGreeting />
        <div className="flex max-w-3xl flex-col gap-4">
          <h1 className="text-4xl leading-[1.08] font-medium tracking-tight text-foreground md:text-6xl">
            Familjens smaker, samlade.
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Familjens recept finns samlade på ett ställe, redo när någon ska laga middag.
          </p>
        </div>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Sök bland familjens recept..."
            aria-label="Sök bland familjens recept"
            className="h-14 w-full rounded-2xl border border-border bg-card pr-4 pl-12 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
          />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
          {recipeCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                category === "Alla"
                  ? "h-11 shrink-0 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
                  : "h-11 shrink-0 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground"
              }
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <FeaturedRecipe recipe={featuredRecipe} />

      <section className="flex flex-col gap-5">
        <h2 className="text-3xl font-medium tracking-tight text-foreground md:text-4xl">Senast tillagda</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recentRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>
    </main>
  );
}
